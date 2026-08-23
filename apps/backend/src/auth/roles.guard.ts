import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import type { Role } from "@farmatodo-retail-media/types";
import { ROLES_KEY } from "./roles.decorator";
import type { RequestUser } from "./request-user";

/**
 * Must run after FirebaseAuthGuard in @UseGuards(). Denies by default when a
 * route declares @Roles(...) and the caller's custom claim does not match —
 * this is the layer that makes "call the API directly with another role"
 * fail server-side, independent of whatever the frontend chooses to render.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("No authenticated user on request");
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (!user.role || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Role '${user.role ?? "none"}' is not allowed to perform this action`,
      );
    }

    return true;
  }
}
