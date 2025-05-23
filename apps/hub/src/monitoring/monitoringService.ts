import { prismaClient } from 'db/client';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { ValidatorManager } from '@/utils/validatorSelection';
import { addSeconds } from '@/utils/dateUtils';
import { Region, WebsiteStatus, WebsiteAlertType } from '@prisma/client'; // Added Prisma for TransactionClient type hint
import { validateWebsite } from '@/src/validator/validationService';
import { randomUUIDv7 } from 'bun';
import { MessageType, REPLY_MESSAGE, verifySignature } from 'common';
import {
  sendWebsiteStatusEmail,
  sendWebsitePingAnomalyEmail,
} from 'common/node-mail';
import { updateUserData } from '@/src/user/userService';
import {
  lastWebsiteStatus,
  recentPings,
  PING_HISTORY_LIMIT,
  PING_ANOMALY_THRESHOLD,
  COST_PER_VALIDATION,
  PLATFORM_FEE_PERCENT,
  CALLBACKS, // For validateWebsite which uses it
} from '@/src/constants';
import { getValidatorTier, getTierBonus } from '@/src/validator/tierUtils';
import { computeHistoricalDataPayloads } from '@/src/website/uptimeService';
import { createAlert } from 'common/mail-util';

// Define types for website and user objects used in the loop, if not already available globally
// These are based on the includes in the prisma queries
interface MonitoredWebsiteUser {
  id: string;
  currentBalance: number;
  emailAlertQuota: number;
  // other user fields if accessed
}

interface MonitoredWebsite {
  id: string;
  userId: string;
  url: string;
  isPaused: boolean;
  lastCheckedAt: Date | null;
  checkFrequency: number;
  preferredRegion: Region | null;
  notificationConfig: {
    email: string | null;
    isDownAlertEnabled: boolean;
    isHighPingAlertEnabled: boolean;
    webhookUrl: string | null;
    webhookSecret: string | null;
    // other notificationConfig fields if accessed
  } | null;
  user: MonitoredWebsiteUser;
  // other website fields if accessed
}

let monitoringInterval: NodeJS.Timeout | null = null;

export function startMonitoring(validatorManagerInstance: ValidatorManager) {
  if (monitoringInterval) {
    console.log('Monitoring is already running.');
    return;
  }
  console.log('Starting monitoring service...');
  monitoringInterval = setInterval(async () => {
    const websitesToMonitorAll = (await prismaClient.website.findMany({
      where: {
        isPaused: false,
        user: {
          currentBalance: {
            gt: 0.1 * LAMPORTS_PER_SOL,
          },
        },
      },
      include: {
        user: true,
        notificationConfig: true,
      },
    })) as MonitoredWebsite[];

    if (validatorManagerInstance.getActiveValidatorsCount() === 0) {
      // console.log('No active validators, skipping monitoring cycle.');
      return;
    }

    const websitesToMonitor = websitesToMonitorAll.filter(
      website =>
        parseFloat(website.user.currentBalance.toString()) >
        0.1 * LAMPORTS_PER_SOL
    );

    await prismaClient.website.updateMany({
      where: {
        id: { notIn: websitesToMonitor.map(website => website.id) },
        isPaused: false, // Only update those that are not already paused by other means
      },
      data: { isPaused: true },
    });

    const websiteByFrequency = (
      await Promise.all(
        websitesToMonitor.map(async website => {
          const nextCheck = await addSeconds(
            website.lastCheckedAt,
            website.checkFrequency
          );
          return {
            website,
            shouldCheck: nextCheck.getTime() <= new Date().getTime(),
          };
        })
      )
    )
      .filter(r => r.shouldCheck)
      .map(r => r.website);

    if (websiteByFrequency.length === 0) {
      // console.log('No websites due for a check in this cycle.');
      return;
    }

    console.log(
      `Processing ${websiteByFrequency.length} websites for validation`
    );

    for (const website of websiteByFrequency) {
      if (website.isPaused) continue;

      const regions = Object.values(Region);
      let validatorsByRegion: { region: Region; validators: any[] }[] = regions
        .map(region => ({
          region,
          validators: validatorManagerInstance.selectMultipleValidators(
            region,
            3
          ),
        }))
        .filter(entry => entry.validators.length > 0);

      if (validatorsByRegion.length === 0) {
        console.log(`No available validators for website ${website.url}`);
        continue;
      }

      if (website.preferredRegion) {
        const preferred = validatorsByRegion.find(
          v => v.region === website.preferredRegion
        );
        // If preferred region has validators, use only that. Otherwise, stick to all available.
        if (preferred && preferred.validators.length > 0) {
          validatorsByRegion = [preferred];
        } else if (preferred && preferred.validators.length === 0) {
          console.log(
            `Preferred region ${website.preferredRegion} has no validators for ${website.url}, using other available regions.`
          );
        }
      }

      for (const { region, validators } of validatorsByRegion) {
        const callbackMap: { [callbackId: string]: any } = {};
        const promises = validators.map(validator => {
          const callbackId = randomUUIDv7();
          callbackMap[callbackId] = validator;
          validatorManagerInstance.updateValidatorMetrics(
            validator.validatorId,
            true
          );
          return validateWebsite(website, validator, callbackId)
            .then(result => ({ result, callbackId, validator }))
            .catch(e => {
              // console.error(`Validation error for ${website.url} with validator ${validator.validatorId}:`, e.message);
              // Ensure metrics are decremented if validateWebsite outright fails before timeout
              validatorManagerInstance.updateValidatorMetrics(
                validator.validatorId,
                false
              );
              delete CALLBACKS[callbackId]; // Clean up callback if promise rejected early
              return null;
            });
        });

        const settledResults = await Promise.allSettled(promises);
        const results = settledResults
          .filter(
            r =>
              r.status === 'fulfilled' &&
              r.value !== null &&
              r.value.result &&
              r.value.result.type === MessageType.VALIDATE
          )
          .map(
            r =>
              (
                r as PromiseFulfilledResult<{
                  result: any;
                  callbackId: string;
                  validator: any;
                }>
              ).value
          );

        if (results.length === 0) {
          // console.log(`No successful validation results for ${website.url} from region ${region}`);
          // Need to decrement activeChecks for validators that were assigned but didn't return a valid result (e.g. timeout handled by validateWebsite, or other errors)
          validators.forEach(v => {
            // Check if this validator did not successfully return a result
            if (
              !results.find(res => res.validator.validatorId === v.validatorId)
            ) {
              validatorManagerInstance.updateValidatorMetrics(
                v.validatorId,
                false
              ); // force decrement
            }
          });
          continue;
        }

        const statusArr = results.map(({ result }) => {
          const { error, total } = result.data;
          return error
            ? WebsiteStatus.OFFLINE
            : total > 1000
              ? WebsiteStatus.DEGRADED
              : WebsiteStatus.ONLINE;
        });
        const majorityStatus =
          statusArr.length > 0
            ? statusArr
                .sort(
                  (a, b) =>
                    statusArr.filter(v => v === a).length -
                    statusArr.filter(v => v === b).length
                )
                .pop()
            : WebsiteStatus.OFFLINE; // Default to OFFLINE if no results somehow

        if (website.notificationConfig && website.user.emailAlertQuota > 0) {
          if (website.notificationConfig.isDownAlertEnabled) {
            const regionKey = region.toString();

            let newStatus: 'DOWN' | 'UP' | null = null;
            if (majorityStatus === WebsiteStatus.OFFLINE) newStatus = 'DOWN';
            if (majorityStatus === WebsiteStatus.ONLINE) newStatus = 'UP';
            if (newStatus) {
              const prevStatus = lastWebsiteStatus[website.id];
              if (prevStatus !== newStatus) {
                if (
                  website.notificationConfig.email &&
                  website.notificationConfig.email !== ''
                ) {
                  await sendWebsiteStatusEmail({
                    to: website.notificationConfig.email,
                    websiteUrl: website.url,
                    status: newStatus,
                    timestamp: new Date().toLocaleString(),
                    userId: website.userId,
                    websiteId: website.id,
                  });
                  await updateUserData(website.userId, {
                    emailAlertQuota: website.user.emailAlertQuota - 1,
                  });
                }

                if (
                  website.notificationConfig.webhookUrl &&
                  website.notificationConfig.webhookUrl !== ''
                ) {
                  await createAlert(
                    website.notificationConfig.webhookUrl,
                    JSON.stringify({
                      event:
                        newStatus === 'DOWN' ? 'website_down' : 'website_up',
                      websiteId: website.id,
                      timestamp: new Date(),
                      details: {
                        websiteUrl: website.url,
                        status: newStatus,
                        region: regionKey,
                      },
                    }),
                    website.userId,
                    website.id,
                    WebsiteAlertType.WEBHOOK
                  );
                }

                lastWebsiteStatus[website.id] = newStatus;
              }
            }
          }

          if (website.notificationConfig.isHighPingAlertEnabled) {
            const regionKey = region.toString();
            const websiteKey = website.id;
            if (!recentPings[websiteKey]) recentPings[websiteKey] = {};
            if (!recentPings[websiteKey][regionKey])
              recentPings[websiteKey][regionKey] = [];

            const onlineResultsPings = results.filter(({ result }) => {
              const { error, total } = result.data;
              return !error && typeof total === 'number';
            });

            if (onlineResultsPings.length > 0) {
              const pings = onlineResultsPings.map(
                ({ result }) => result.data.total as number
              );
              const sorted = [...pings].sort((a, b) => a - b);
              const medianPing = sorted[Math.floor(sorted.length / 2)];

              recentPings[websiteKey][regionKey].push(medianPing);
              if (
                recentPings[websiteKey][regionKey].length > PING_HISTORY_LIMIT
              ) {
                recentPings[websiteKey][regionKey].shift();
              }

              const history = recentPings[websiteKey][regionKey];
              if (history.length >= PING_HISTORY_LIMIT) {
                const avg =
                  history.slice(0, -1).reduce((a, b) => a + b, 0) /
                  (history.length - 1);
                if (avg > 0 && medianPing > avg * PING_ANOMALY_THRESHOLD) {
                  if (
                    website.notificationConfig.email &&
                    website.notificationConfig.email !== ''
                  ) {
                    await sendWebsitePingAnomalyEmail({
                      to: website.notificationConfig.email!,
                      websiteUrl: website.url,
                      region: regionKey,
                      currentPing: medianPing,
                      averagePing: Math.round(avg),
                      timestamp: new Date().toLocaleString(),
                      userId: website.userId,
                      websiteId: website.id,
                    });
                    await updateUserData(website.userId, {
                      emailAlertQuota: website.user.emailAlertQuota - 1,
                    });
                  }

                  if (
                    website.notificationConfig.webhookUrl &&
                    website.notificationConfig.webhookUrl !== ''
                  ) {
                    await createAlert(
                      website.notificationConfig.webhookUrl,
                      JSON.stringify({
                        event: 'high_ping',
                        websiteId: website.id,
                        timestamp: new Date(),
                        details: {
                          websiteUrl: website.url,
                          region: regionKey,
                          currentPing: medianPing,
                          averagePing: Math.round(avg),
                        },
                      }),
                      website.userId,
                      website.id,
                      WebsiteAlertType.WEBHOOK
                    );
                  }

                  recentPings[websiteKey][regionKey] = []; // Clear history to avoid spam
                }
              }
            }
          }
        }

        let totalValidatorPayout = 0;
        const validatorPayouts: {
          validatorId: string;
          payout: number;
          tier: string;
        }[] = [];

        for (const { result, validator } of results) {
          // callbackId removed as it's not used here
          const { error, total, signedMessage } = result.data;
          const verified = verifySignature(
            REPLY_MESSAGE(result.data.callbackId), // Use callbackId from result.data
            signedMessage,
            validator.publicKey
          );
          if (!verified) {
            console.error(
              `Invalid signature from validator ${validator.publicKey} for website ${website.url}`
            );
            // Do not penalize validator an additional time here if signature fails, covered by trust score update
            continue;
          }
          const tier = getValidatorTier(validator.trustScore);
          const bonus = getTierBonus(tier);
          const payout = COST_PER_VALIDATION * (1 + bonus);
          totalValidatorPayout += payout;
          validatorPayouts.push({
            validatorId: validator.validatorId,
            payout,
            tier,
          });
        }
        const platformFee = totalValidatorPayout * PLATFORM_FEE_PERCENT;
        const totalCost = totalValidatorPayout + platformFee;

        if (totalCost > 0) {
          // Compute historical data payloads outside the transaction
          const historicalPayloads = await computeHistoricalDataPayloads(
            website.id
          );
          await prismaClient.$transaction(async tx => {
            await tx.user.update({
              where: { id: website.userId },
              data: { currentBalance: { decrement: totalCost } },
            });
            for (const { validatorId, payout } of validatorPayouts) {
              await tx.validator.update({
                where: { id: validatorId },
                data: { pendingPayouts: { increment: payout } },
              });
            }
            for (const { result, validator } of results) {
              const {
                error,
                total,
                signedMessage,
                callbackId: tickCallbackId,
              } = result.data;
              const status = error
                ? WebsiteStatus.OFFLINE
                : total > 1000
                  ? WebsiteStatus.DEGRADED
                  : WebsiteStatus.ONLINE;
              const tickVerified = verifySignature(
                REPLY_MESSAGE(tickCallbackId),
                signedMessage,
                validator.publicKey
              );
              if (!tickVerified) {
                console.error(
                  `Signature verification failed for tick from validator ${validator.publicKey} on ${website.url}. No tick recorded.`
                );
                continue;
              }
              await tx.validator.update({
                where: { id: validator.validatorId },
                data: {
                  trustScore: { increment: status === majorityStatus ? 1 : -1 },
                },
              });
              await tx.websiteTick.create({
                data: {
                  websiteId: website.id,
                  validatorId: validator.validatorId,
                  region,
                  status,
                  nameLookup: result.data.nameLookup,
                  connection: result.data.connection,
                  tlsHandshake: result.data.tlsHandshake,
                  dataTransfer: result.data.dataTransfer,
                  ttfb: result.data.ttfb,
                  total: result.data.total,
                  error: result.data.error,
                  createdAt: new Date(),
                },
              });
            }
            // Upsert historical data
            if (historicalPayloads.daily) {
              await tx.uptimeHistory.upsert(historicalPayloads.daily);
            }
            if (historicalPayloads.weekly) {
              await tx.uptimeHistory.upsert(historicalPayloads.weekly);
            }
            if (historicalPayloads.monthly) {
              await tx.uptimeHistory.upsert(historicalPayloads.monthly);
            }
            await tx.website.update(historicalPayloads.websiteUpdate);
          });
        }

        // Update activeChecks for all validators involved in this batch for this region/website combination
        validators.forEach(v => {
          validatorManagerInstance.updateValidatorMetrics(v.validatorId, false);
        });
      }
    }
  }, 60 * 1000);
}

export function stopMonitoring() {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('Monitoring service stopped.');
  } else {
    console.log('Monitoring service is not running.');
  }
}
