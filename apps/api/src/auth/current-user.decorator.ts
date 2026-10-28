import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Returns the authenticated user attached to the request by JwtAuthGuard.
 * Usage: `@CurrentUser() user: AuthUser`
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
