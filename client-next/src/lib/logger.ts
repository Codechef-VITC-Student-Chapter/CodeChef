/**
 * Request & Response Logger Utility for Next.js 16
 * Sanitizes sensitive data (passwords, tokens, cookies, auth headers)
 */

const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

export function getStatusColor(status: number): string {
  if (status >= 500) return ANSI.red;
  if (status >= 400) return ANSI.yellow;
  if (status >= 300) return ANSI.cyan;
  if (status >= 200) return ANSI.green;
  return ANSI.reset;
}

export function logProxyRequest(
  method: string,
  pathname: string,
  action: string,
  statusCode: number,
  durationMs: number
) {
  const color = getStatusColor(statusCode);
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  console.log(
    `${ANSI.dim}[${time}]${ANSI.reset} ${ANSI.magenta}[Next.js Proxy]${ANSI.reset} ` +
    `${ANSI.bold}${method.padEnd(6)}${ANSI.reset} ${pathname} ` +
    `${color}${statusCode}${ANSI.reset} (${action}) ${ANSI.dim}${durationMs}ms${ANSI.reset}`
  );
}

export function logApiExecution(
  method: string,
  pathname: string,
  statusCode: number,
  durationMs: number,
  extra?: string
) {
  const color = getStatusColor(statusCode);
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  const extraStr = extra ? ` - ${ANSI.dim}${extra}${ANSI.reset}` : "";
  console.log(
    `${ANSI.dim}[${time}]${ANSI.reset} ${ANSI.blue}[Next.js API]${ANSI.reset} ` +
    `${ANSI.bold}${method.padEnd(6)}${ANSI.reset} ${pathname} ` +
    `${color}${statusCode}${ANSI.reset} ${ANSI.dim}${durationMs}ms${ANSI.reset}${extraStr}`
  );
}

export function logBackendForward(
  method: string,
  sourcePath: string,
  targetUrl: string
) {
  const time = new Date().toLocaleTimeString("en-GB", { hour12: false });
  console.log(
    `${ANSI.dim}[${time}]${ANSI.reset} ${ANSI.cyan}[Next.js Forward]${ANSI.reset} ` +
    `${ANSI.bold}${method.padEnd(6)}${ANSI.reset} ${sourcePath} -> ${targetUrl}`
  );
}
