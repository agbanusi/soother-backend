import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor() {
    super();
  }

  async validate(apiKey: string): Promise<any> {
    // Get the API key from environment variable
    const validApiKey = process.env.API_KEY;

    if (!validApiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // If API key is valid, return a user object
    // This will be attached to the request
    return { isAuthenticated: true };
  }
}
