import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { AppLogger } from '../../logger/logger.service.js';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLogger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { id?: string }>();
    const response = http.getResponse<Response>();
    return next.handle().pipe(
      tap(() => this.logger.logHttpRequest({
        method: request.method,
        path: request.url,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
        requestId: request.id,
      })),
    );
  }
}
