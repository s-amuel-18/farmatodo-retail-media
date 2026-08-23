import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { newCampaignInputSchema, rejectCampaignSchema } from "@farmatodo-retail-media/types";
import type {
  AuthenticatedUser,
  CampaignListFilters,
  NewCampaignInput,
} from "@farmatodo-retail-media/types";
import { CurrentUser } from "../../../auth/current-user.decorator";
import { FirebaseAuthGuard } from "../../../auth/firebase-auth.guard";
import { Roles } from "../../../auth/roles.decorator";
import { RolesGuard } from "../../../auth/roles.guard";
import { ZodValidationPipe } from "../../../common/zod-validation.pipe";
import { ApproveCampaignUseCase } from "../../application/use-cases/approve-campaign.use-case";
import { CreateCampaignUseCase } from "../../application/use-cases/create-campaign.use-case";
import { GetCampaignUseCase } from "../../application/use-cases/get-campaign.use-case";
import { ListCampaignsUseCase } from "../../application/use-cases/list-campaigns.use-case";
import { RejectCampaignUseCase } from "../../application/use-cases/reject-campaign.use-case";
import { SubmitCampaignUseCase } from "../../application/use-cases/submit-campaign.use-case";
import { UpdateCampaignUseCase } from "../../application/use-cases/update-campaign.use-case";
import { ListCampaignsQueryDto, parseListFilters } from "./dto/list-campaigns.query";

@Controller("campaigns")
@UseGuards(FirebaseAuthGuard, RolesGuard)
export class CampaignsController {
  constructor(
    private readonly createCampaign: CreateCampaignUseCase,
    private readonly updateCampaign: UpdateCampaignUseCase,
    private readonly getCampaign: GetCampaignUseCase,
    private readonly listCampaigns: ListCampaignsUseCase,
    private readonly submitCampaign: SubmitCampaignUseCase,
    private readonly approveCampaign: ApproveCampaignUseCase,
    private readonly rejectCampaign: RejectCampaignUseCase,
  ) {}

  @Post()
  @Roles("COMMERCIAL_ANALYST")
  @UsePipes(new ZodValidationPipe(newCampaignInputSchema))
  create(@Body() body: NewCampaignInput, @CurrentUser() actor: AuthenticatedUser) {
    return this.createCampaign.execute({ data: body, actor });
  }

  @Patch(":id")
  @Roles("COMMERCIAL_ANALYST")
  @UsePipes(new ZodValidationPipe(newCampaignInputSchema))
  update(
    @Param("id") id: string,
    @Body() body: NewCampaignInput,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.updateCampaign.execute({ campaignId: id, data: body, actor });
  }

  @Get()
  @Roles("COMMERCIAL_ANALYST", "APPROVER_MANAGER")
  list(@Query() query: ListCampaignsQueryDto, @CurrentUser() actor: AuthenticatedUser) {
    const filters: CampaignListFilters = parseListFilters(query);
    return this.listCampaigns.execute({ filters, actor });
  }

  @Get(":id")
  @Roles("COMMERCIAL_ANALYST", "APPROVER_MANAGER")
  get(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.getCampaign.execute({ campaignId: id, actor });
  }

  @Post(":id/submit")
  @Roles("COMMERCIAL_ANALYST")
  submit(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.submitCampaign.execute({ campaignId: id, actor });
  }

  @Post(":id/approve")
  @Roles("APPROVER_MANAGER")
  approve(@Param("id") id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.approveCampaign.execute({ campaignId: id, actor });
  }

  @Post(":id/reject")
  @Roles("APPROVER_MANAGER")
  @UsePipes(new ZodValidationPipe(rejectCampaignSchema))
  reject(
    @Param("id") id: string,
    @Body() body: { comment: string },
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.rejectCampaign.execute({ campaignId: id, comment: body.comment, actor });
  }
}
