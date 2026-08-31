import { Request, Response, Router } from "express";

import { addHandler } from "../../../payloads/response";
import { handleLeftEitherIfNeeded } from "../../../utils/error";
import { initializationMiddleware } from "../middlewares/initializationMiddleware";
import { checkValidateAndGetRelativePath } from "../services/prevalidatedUrisService";

const prevalidatedUriPath = "/prevalidated/uri/*";

export const generatePrevalidatedUriPath = (uri: string) =>
  prevalidatedUriPath.replace("*", uri);

export const sendPrevalidatedUrisRouter = Router();

addHandler(
  sendPrevalidatedUrisRouter,
  "get",
  prevalidatedUriPath,
  // Middleware have to be used like this (instead of directly giving the middleware to the router via use)
  // because supertest (when testing) calls every middleware upon test initialization, even if it not in a
  // router directly called by the test, thus making every test fail due to the authentication middleware
  initializationMiddleware((req: Request, res: Response) => {
    const relativePathEither = checkValidateAndGetRelativePath(req);
    if (handleLeftEitherIfNeeded(relativePathEither, res)) {
      return;
    }
    res.sendFile(relativePathEither.right, { root: "." });
  }),
  () => 500 + 1000 * Math.random()
);
