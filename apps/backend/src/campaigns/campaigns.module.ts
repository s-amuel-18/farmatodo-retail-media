import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CAMPAIGN_REPOSITORY } from "./application/ports/campaign-repository.port";
import { MEDIA_COST_REPOSITORY } from "./application/ports/media-cost-repository.port";
import { ApproveCampaignUseCase } from "./application/use-cases/approve-campaign.use-case";
import { CreateCampaignUseCase } from "./application/use-cases/create-campaign.use-case";
import { GetCampaignUseCase } from "./application/use-cases/get-campaign.use-case";
import { ListCampaignsUseCase } from "./application/use-cases/list-campaigns.use-case";
import { RejectCampaignUseCase } from "./application/use-cases/reject-campaign.use-case";
import { SubmitCampaignUseCase } from "./application/use-cases/submit-campaign.use-case";
import { UpdateCampaignUseCase } from "./application/use-cases/update-campaign.use-case";
import { CampaignsController } from "./infrastructure/http/campaigns.controller";
import { FirestoreCampaignRepository } from "./infrastructure/firestore/firestore-campaign.repository";
import { FirestoreMediaCostRepository } from "./infrastructure/firestore/firestore-media-cost.repository";
import type { CampaignRepository } from "./application/ports/campaign-repository.port";
import type { MediaCostRepository } from "./application/ports/media-cost-repository.port";

@Module({
  imports: [AuthModule],
  controllers: [CampaignsController],
  providers: [
    { provide: CAMPAIGN_REPOSITORY, useClass: FirestoreCampaignRepository },
    { provide: MEDIA_COST_REPOSITORY, useClass: FirestoreMediaCostRepository },
    {
      provide: CreateCampaignUseCase,
      inject: [CAMPAIGN_REPOSITORY, MEDIA_COST_REPOSITORY],
      useFactory: (repo: CampaignRepository, costs: MediaCostRepository) =>
        new CreateCampaignUseCase(repo, costs),
    },
    {
      provide: UpdateCampaignUseCase,
      inject: [CAMPAIGN_REPOSITORY, MEDIA_COST_REPOSITORY],
      useFactory: (repo: CampaignRepository, costs: MediaCostRepository) =>
        new UpdateCampaignUseCase(repo, costs),
    },
    {
      provide: GetCampaignUseCase,
      inject: [CAMPAIGN_REPOSITORY],
      useFactory: (repo: CampaignRepository) => new GetCampaignUseCase(repo),
    },
    {
      provide: ListCampaignsUseCase,
      inject: [CAMPAIGN_REPOSITORY],
      useFactory: (repo: CampaignRepository) => new ListCampaignsUseCase(repo),
    },
    {
      provide: SubmitCampaignUseCase,
      inject: [CAMPAIGN_REPOSITORY],
      useFactory: (repo: CampaignRepository) => new SubmitCampaignUseCase(repo),
    },
    {
      provide: ApproveCampaignUseCase,
      inject: [CAMPAIGN_REPOSITORY],
      useFactory: (repo: CampaignRepository) => new ApproveCampaignUseCase(repo),
    },
    {
      provide: RejectCampaignUseCase,
      inject: [CAMPAIGN_REPOSITORY],
      useFactory: (repo: CampaignRepository) => new RejectCampaignUseCase(repo),
    },
  ],
})
export class CampaignsModule {}
