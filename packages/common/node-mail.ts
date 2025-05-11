// import nodemailer from 'nodemailer';
import { createAlert } from './mail-util';
import { WebsiteAlertType } from '@prisma/client';
// Create a transporter using SMTP
// export const transporter = nodemailer.createTransport({
//   host: 'smtp.gmail.com', // e.g., smtp.gmail.com
//   port: 587, // or 465 for SSL
//   secure: false, // true for 465, false for 587
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });

function websiteStatusTemplate({
  websiteUrl,
  status,
  timestamp,
}: {
  websiteUrl: string;
  status: 'DOWN' | 'UP';
  timestamp: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Website ${status === 'DOWN' ? 'Down' : 'Up'} Notification</h2>
      <p>
        <strong>${websiteUrl}</strong> is now <span style="color: ${status === 'DOWN' ? 'red' : 'green'};">${status === 'DOWN' ? 'OFFLINE' : 'ONLINE'}</span> as of <strong>${timestamp}</strong>.
      </p>
      <p>
        ${status === 'DOWN' ? "Please check your website's status and take necessary action." : 'Your website is back online.'}
      </p>
      <hr>
      <small>This is an automated notification from DPIN Uptime Monitor.</small>
    </div>
  `;
}

export async function sendWebsiteStatusEmail({
  to,
  websiteUrl,
  status,
  timestamp,
  userId,
  websiteId,
}: {
  to: string;
  websiteUrl: string;
  status: 'DOWN' | 'UP';
  timestamp: string;
  userId: string;
  websiteId: string;
}) {
  await createAlert(
    to,
    JSON.stringify({
      from: 'DPIN Uptime Alert <alert.dpin-uptime@itssvk.dev>',
      to,
      subject: `Notification: ${websiteUrl} is ${status === 'DOWN' ? 'DOWN' : 'ONLINE'}`,
      html: websiteStatusTemplate({ websiteUrl, status, timestamp }),
    }),
    userId,
    websiteId,
    WebsiteAlertType.EMAIL
  );

  return;

  // const info = await transporter.sendMail({
  //   from: 'DPIN Uptime Alert <alert.dpin-uptime@itssvk.dev>',
  //   to,
  //   subject: `Notification: ${websiteUrl} is ${status === 'DOWN' ? 'DOWN' : 'ONLINE'}`,
  //   html: websiteStatusTemplate({ websiteUrl, status, timestamp }),
  // });

  // if (info.rejected.length > 0) {
  //   console.error('Failed to send website status email:', info.rejected);
  //   return null;
  // }

  // return info;
}

function websitePingAnomalyTemplate({
  websiteUrl,
  region,
  currentPing,
  averagePing,
  timestamp,
}: {
  websiteUrl: string;
  region: string;
  currentPing: number;
  averagePing: number;
  timestamp: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif;">
      <h2>Website High Ping Alert</h2>
      <p>
        <strong>${websiteUrl}</strong> is experiencing <span style="color: orange;">high latency</span> in <strong>${region}</strong> region.<br>
        <strong>Current Ping:</strong> ${currentPing} ms<br>
        <strong>Usual Average Ping:</strong> ${averagePing} ms<br>
        <strong>Time:</strong> ${timestamp}
      </p>
      <p>
        This may indicate a temporary network issue or server overload in this region.
      </p>
      <hr>
      <small>This is an automated notification from DPIN Uptime Monitor.</small>
    </div>
  `;
}

export async function sendWebsitePingAnomalyEmail({
  to,
  websiteUrl,
  region,
  currentPing,
  averagePing,
  timestamp,
  userId,
  websiteId,
}: {
  to: string;
  websiteUrl: string;
  region: string;
  currentPing: number;
  averagePing: number;
  timestamp: string;
  userId: string;
  websiteId: string;
}) {
  await createAlert(
    to,
    JSON.stringify({
      from: 'DPIN Uptime Alert <alert.dpin-uptime@itssvk.dev>',
      to,
      subject: `Alert: High Ping for ${websiteUrl} in ${region}`,
      html: websitePingAnomalyTemplate({
        websiteUrl,
        region,
        currentPing,
        averagePing,
        timestamp,
      }),
    }),
    userId,
    websiteId,
    WebsiteAlertType.EMAIL
  );

  return;

  // const info = await transporter.sendMail({
  //   from: 'DPIN Uptime Alert <alert.dpin-uptime@itssvk.dev>',
  //   to,
  //   subject: `Alert: High Ping for ${websiteUrl} in ${region}`,
  //   html: websitePingAnomalyTemplate({
  //     websiteUrl,
  //     region,
  //     currentPing,
  //     averagePing,
  //     timestamp,
  //   }),
  // });

  // if (info.rejected.length > 0) {
  //   console.error('Failed to send website ping anomaly email:', info.rejected);
  //   return null;
  // }

  // return info;
}
