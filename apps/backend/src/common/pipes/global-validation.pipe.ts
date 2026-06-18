import { BadRequestException, ValidationPipe } from '@nestjs/common';

export function createGlobalValidationPipe() {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    exceptionFactory: (errors) => new BadRequestException({ message: 'Validation failed', errors }),
  });
}
