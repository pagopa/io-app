import { ProblemJson } from "@pagopa/ts-commons/lib/responses";
import { NextFunction, Request, Response } from "express-serve-static-core";

import { ErrorDTO } from "../payloads/features/idpay/error";
import { isSessionTokenValid } from "../persistence/sessionInfo";

type FastLoginMiddleware401Response = ErrorDTO & ProblemJson;
const responseFor401: FastLoginMiddleware401Response = {
  code: 401,
  message: "Unauthorized"
};

/**
 * If the response error is defined as a global config this middleware returns
 * an error from those ones defined if the current change is less or equal than
 * one defined
 *
 * @param req
 * @param res
 * @param next
 */
export const fastLoginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (isSessionTokenValid(req)) {
    next();
    return;
  }
  res.status(401).send(responseFor401);
};
