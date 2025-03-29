import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// api-key.guard.ts
@Injectable()
export class ApiKeyGuard extends AuthGuard('api-key') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    return apiKey === process.env.FACTORY_API_KEY;
  }
}
