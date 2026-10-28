import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common';
import { AuthUser } from './current-user.decorator';

/**
 * Requires request.user.isAdmin. Must run AFTER JwtAuthGuard, e.g.
 * `@UseGuards(JwtAuthGuard, AdminGuard)`.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthUser | undefined = request.user;

    if (!user?.isAdmin) {
      throw new ForbiddenException('Admin privileges required');
    }
    return true;
  }
}
