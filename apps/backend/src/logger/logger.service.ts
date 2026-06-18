import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor() {
    const levels: LogLevel[] = process.env.NODE_ENV === 'production' ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'];
    super('NovaMeet', { timestamp: true, logLevels: levels });
  }

  logHttpRequest(context: { method: string; path: string; statusCode: number; durationMs: number; requestId?: string }) {
    this.log(JSON.stringify({ event: 'http_request', ...context }));
  }
}
