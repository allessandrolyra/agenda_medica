type LogLevel = 'info' | 'warn' | 'error'

const log = (level: LogLevel, message: string, data?: unknown) => {
  const timestamp = new Date().toISOString()
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  fn(`[${timestamp}] [${level.toUpperCase()}]`, message, data ?? '')
}

export const logger = {
  info: (msg: string, data?: unknown) => log('info', msg, data),
  warn: (msg: string, data?: unknown) => log('warn', msg, data),
  error: (msg: string, data?: unknown) => log('error', msg, data),
}
