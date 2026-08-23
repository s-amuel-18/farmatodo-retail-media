import { Module } from "@nestjs/common";
import { FirebaseModule } from "./firebase/firebase.module";
import { AuthModule } from "./auth/auth.module";
import { CampaignsModule } from "./campaigns/campaigns.module";

@Module({
  imports: [FirebaseModule, AuthModule, CampaignsModule],
})
export class AppModule {}
