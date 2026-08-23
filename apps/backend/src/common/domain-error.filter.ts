import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";
import {
  CampaignNotFoundError,
  ForbiddenActionError,
  InvalidTransitionError,
  ValidationError,
} from "../campaigns/domain/errors";

/**
 * Translates thrown domain errors into HTTP responses. Kept separate from the
 * domain/application layers on purpose — they don't know HTTP exists; this is
 * the only place that maps "what went wrong" to a status code.
 */
@Catch()
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (exception instanceof ForbiddenActionError) {
      response.status(403).json({ statusCode: 403, message: exception.message });
      return;
    }
    if (exception instanceof InvalidTransitionError) {
      response.status(409).json({ statusCode: 409, message: exception.message });
      return;
    }
    if (exception instanceof ValidationError) {
      response.status(400).json({ statusCode: 400, message: exception.message });
      return;
    }
    if (exception instanceof CampaignNotFoundError) {
      response.status(404).json({ statusCode: 404, message: exception.message });
      return;
    }

    // eslint-disable-next-line no-console
    console.error(exception);
    response.status(500).json({ statusCode: 500, message: "Internal server error" });
  }
}
