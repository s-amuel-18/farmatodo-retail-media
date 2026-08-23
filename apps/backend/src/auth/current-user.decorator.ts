import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from "@nestjs/common";
import { Request } from "express";
import type { AuthenticatedUser } from "@farmatodo-retail-media/types";
import type { RequestUser } from "./request-user";

/**
 * Only safe to use on routes guarded by [FirebaseAuthGuard, RolesGuard] —
 * RolesGuard is what guarantees `role` is actually present at this point.
 */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: RequestUser }>();
    const user = request.user;

    if (!user?.role) {
      throw new InternalServerErrorException(
        "CurrentUser used on a route without RolesGuard",
      );
    }

    return { uid: user.uid, email: user.email, role: user.role };
  },
);
