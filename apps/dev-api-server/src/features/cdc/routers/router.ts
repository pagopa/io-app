import { Request, Response, Router } from "express";

import { addHandler, SupportedMethod } from "../../../payloads/response";

export const cdcRouter = Router();

const CDC_PREFIX = "/api/cdc-support/v1";

const addCdcPrefix = (path: string) => `${CDC_PREFIX}${path}`;

export const addCdcHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(cdcRouter, method, addCdcPrefix(path), handleRequest);
