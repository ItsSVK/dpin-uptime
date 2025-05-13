import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

// HTML template for website status change
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
}: {
  to: string | string[];
  websiteUrl: string;
  status: 'DOWN' | 'UP';
  timestamp: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'DPIN Uptime Alert <alert@itssvk.dev>',
    to: Array.isArray(to) ? to : [to],
    subject: `Notification: ${websiteUrl} is ${status === 'DOWN' ? 'DOWN' : 'ONLINE'}`,
    html: websiteStatusTemplate({ websiteUrl, status, timestamp }),
  });

  if (error) {
    console.error('Failed to send website status email:', error);
    return null;
  }

  return data;
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
}: {
  to: string | string[];
  websiteUrl: string;
  region: string;
  currentPing: number;
  averagePing: number;
  timestamp: string;
}) {
  const { data, error } = await resend.emails.send({
    from: 'DPIN Uptime Alert <alert@itssvk.dev>',
    to: Array.isArray(to) ? to : [to],
    subject: `Alert: High Ping for ${websiteUrl} in ${region}`,
    html: websitePingAnomalyTemplate({
      websiteUrl,
      region,
      currentPing,
      averagePing,
      timestamp,
    }),
  });

  if (error) {
    console.error('Failed to send website ping anomaly email:', error);
    return null;
  }

  return data;
}
