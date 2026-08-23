import { Module } from "@nestjs/common";
import { FirebaseAuthGuard } from "./firebase-auth.guard";
import { RolesGuard } from "./roles.guard";

@Module({
  providers: [FirebaseAuthGuard, RolesGuard],
  exports: [FirebaseAuthGuard, RolesGuard],
})
export class AuthModule {}
