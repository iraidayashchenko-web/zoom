import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request & { id?: string }, response: Response, next: NextFunction) {
    const incoming = request.headers['x-request-id'];
    const requestId = Array.isArray(incoming) ? incoming[0] : incoming ?? crypto.randomUUID();
    request.id = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  }
}
