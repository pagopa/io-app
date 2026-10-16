import { Request, Response } from "express";

import { getProblemJson } from "../payloads/error";
import { logExpressResponseWarning } from "../utils/logging";

// Middleware have to be used like this (instead of directly giving the middleware to the router via use)
// because supertest (when testing) calls every middleware upon test initialization, even if it not in a
// router directly called by the test, thus making every test fail due to the authentication middleware
export const authorizationMiddleware =
  (nextRequest: (_req: Request, _res: Response) => void) =>
  (request: Request, response: Response) => {
    const authorizationValue = request.headers.authorization;
    if (
      typeof authorizationValue !== "string" ||
      !/^bearer\s+.+/i.test(authorizationValue)
    ) {
      const problemJson = getProblemJson(
        401,
        "Unauthenticated invocation",
        `Missing or invalid value for header 'Authorization'`
      );
      logExpressResponseWarning(401, problemJson);
    }
    nextRequest(request, response);
  };
