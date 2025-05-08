import got, { TimeoutError, RequestError } from 'got';
import type { WebsiteTick } from '@prisma/client';

export async function checkURL(url: string): Promise<
  Omit<
    WebsiteTick,
    'status' | 'websiteId' | 'validatorId' | 'createdAt' | 'id' | 'region'
  > & {
    statusCode: number;
  }
> {
  // Validate URL format first
  try {
    new URL(url);
  } catch (err) {
    return {
      error: 'Invalid URL format',
      statusCode: 400,
      nameLookup: 0,
      connection: 0,
      tlsHandshake: 0,
      ttfb: 0,
      dataTransfer: 0,
      total: 0,
    };
  }

  try {
    const response = await got(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        Connection: 'keep-alive',
      },
      throwHttpErrors: false,
      timeout: {
        lookup: 3000, // DNS lookup timeout
        connect: 5000, // TCP connection timeout
        secureConnect: 5000, // TLS handshake timeout
        socket: 5000, // Socket inactivity timeout
        send: 5000, // Send timeout
        response: 10000, // Response timeout
      },
      retry: {
        limit: 1, // One retry attempt
        methods: ['GET'],
        statusCodes: [408, 429, 500, 502, 503, 504], // Retry on these status codes
        errorCodes: [
          'ETIMEDOUT',
          'ECONNRESET',
          'EADDRINUSE',
          'ECONNREFUSED',
          'EPIPE',
          'ENOTFOUND',
          'ENETUNREACH',
          'EAI_AGAIN',
        ],
      },
      decompress: true, // Handle gzip/deflate content
    });

    const t = response.timings;

    // Ensure all timing values exist and are numbers
    const safeNumber = (
      value: number | undefined,
      fallback: number = 0
    ): number => {
      return typeof value === 'number' && !isNaN(value)
        ? Number(value.toFixed(2))
        : fallback;
    };

    // Calculate timings with safe fallbacks
    const startTime = safeNumber(t.start);
    const lookupTime = safeNumber(t.lookup);
    const connectTime = safeNumber(t.connect);
    const secureConnectTime = safeNumber(t.secureConnect);
    const responseTime = safeNumber(t.response);
    const endTime = safeNumber(t.end);

    const result = {
      statusCode: Number(response.statusCode),
      nameLookup: safeNumber(lookupTime - startTime),
      connection: safeNumber(connectTime - lookupTime),
      tlsHandshake: secureConnectTime
        ? safeNumber(secureConnectTime - connectTime)
        : 0,
      ttfb: safeNumber(responseTime - startTime),
      dataTransfer: safeNumber(endTime - responseTime),
      total: safeNumber(endTime - startTime),
      error: '',
    };

    // Validate timing consistency
    if (
      result.total < 0 ||
      result.nameLookup < 0 ||
      result.connection < 0 ||
      result.tlsHandshake < 0 ||
      result.ttfb < 0 ||
      result.dataTransfer < 0
    ) {
      throw new Error('Invalid timing calculations detected');
    }

    console.log(`[OK] ${url} - Status: ${result.statusCode}`);
    // console.table(result); // console.table might not be ideal for server logs

    return result;
  } catch (error: unknown) {
    // Specific error handling for different types of errors
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500;

    if (error instanceof TimeoutError) {
      errorMessage = 'Request timed out';
      statusCode = 408;
    } else if (error instanceof RequestError) {
      const err = error as RequestError;
      if (err.code === 'ENOTFOUND') {
        errorMessage = 'DNS lookup failed';
        statusCode = 503;
      } else if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Connection refused';
        statusCode = 503;
      } else if (err.code === 'ECONNRESET') {
        errorMessage = 'Connection reset';
        statusCode = 503;
      } else if (err.code === 'ETIMEDOUT') {
        errorMessage = 'Connection timed out';
        statusCode = 408;
      } else {
        errorMessage = `Network error: ${err.code}`;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error(`[FAIL] ${url}: ${errorMessage}`);
    // console.error(error); // Avoid logging the full error object unless in debug mode

    return {
      error: errorMessage,
      statusCode,
      nameLookup: 0,
      connection: 0,
      tlsHandshake: 0,
      ttfb: 0,
      dataTransfer: 0,
      total: 0,
    };
  }
}
