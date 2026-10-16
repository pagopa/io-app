import { Request, Response, Router } from "express";

import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { authenticationMiddleware } from "../middlewares/authenticationMiddleware";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { lollipopLambdaResponseFromBodyAndConfig } from "../services/lollipopLambdaService";
import { checkAndValidateLollipopHeaders } from "../services/lollipopService";

const lollipopLambdaPath = "/aws/send/lollipop-test";

export const generateLollipopLambdaGetPath = () => lollipopLambdaPath;

export const sendLollipopLambdaRouter = Router();

addHandler(
  sendLollipopLambdaRouter,
  "get",
  lollipopLambdaPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req, res) =>
      commonLollipopLambdaHandling("GET", req, res)
    )
  )
);

addHandler(
  sendLollipopLambdaRouter,
  "post",
  lollipopLambdaPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  authenticationMiddleware(
    initializationMiddleware((req, res) =>
      commonLollipopLambdaHandling("POST", req, res)
    )
  )
);

const commonLollipopLambdaHandling = (
  requestVerb: "GET" | "POST",
  req: Request,
  res: Response
) => {
  const sendConfig = ioDevServerConfig.send;
  if (!sendConfig.skipLollipopVerification) {
    const lollipopHeadersEither = checkAndValidateLollipopHeaders(req.headers);
    if (handleLeftEitherIfNeeded(lollipopHeadersEither, res)) {
      return;
    }
  }

  const requestBody = requestVerb === "POST" ? req.body : undefined;
  const lollipopLambdaGetResponseEither =
    lollipopLambdaResponseFromBodyAndConfig(
      requestVerb,
      requestBody,
      sendConfig
    );
  if (handleLeftEitherIfNeeded(lollipopLambdaGetResponseEither, res)) {
    return;
  }
  res.status(200).json(lollipopLambdaGetResponseEither.right);
};
