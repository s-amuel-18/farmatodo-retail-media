import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import type { Role } from "@farmatodo-retail-media/types";
import { FirebaseAdminService } from "../firebase/firebase-admin.service";
import type { RequestUser } from "./request-user";

const ROLE_CLAIM = "role";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly firebaseAdmin: FirebaseAdminService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException("Missing bearer token");
    }

    try {
      const decoded = await this.firebaseAdmin.auth().verifyIdToken(token);
      const role = decoded[ROLE_CLAIM] as Role | undefined;

      const user: RequestUser = {
        uid: decoded.uid,
        email: decoded.email ?? "",
        role,
      };

      (request as Request & { user: RequestUser }).user = user;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private extractToken(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) return null;
    return header.slice("Bearer ".length).trim() || null;
  }
}
