export function formatIP(ip: string) {
  const ipv4MappedRegex = /^::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;

  // Handle IPv6 loopback
  if (ip === '::1') {
    return '127.0.0.1';
  }

  // Handle IPv4-mapped IPv6
  const mappedMatch = ip.match(ipv4MappedRegex);
  if (mappedMatch) {
    return mappedMatch[1];
  }

  // Check for regular IPv4
  const ipv4Regex =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  if (ipv4Regex.test(ip)) {
    return ip;
  }

  // Return raw IPv6 or unrecognized format as-is
  return ip;
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  const cfConnectingIp = headers.get('cf-connecting-ip');
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');

  return (
    cfConnectingIp ||
    (forwardedFor && forwardedFor.split(',')[0].trim()) ||
    realIp ||
    '0.0.0.0'
  );
}
