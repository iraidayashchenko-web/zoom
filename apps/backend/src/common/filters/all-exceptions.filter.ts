import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '../../logger/logger.service.js';
import { ProblemDetails } from '../types/problem-details.js';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request & { id?: string }>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const detail = exception instanceof Error ? exception.message : 'Unexpected error';
    const problem: ProblemDetails = {
      type: status >= 500 ? 'about:blank#internal-server-error' : 'about:blank#request-error',
      title: HttpStatus[status] ?? 'Error',
      status,
      detail,
      instance: request.url,
      requestId: request.id ?? request.headers['x-request-id']?.toString(),
      timestamp: new Date().toISOString(),
    };

    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(detail, stack, 'AllExceptionsFilter');
    }

    response.status(status).type('application/problem+json').json(problem);
  }
}
