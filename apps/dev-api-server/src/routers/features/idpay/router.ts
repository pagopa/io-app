import { Request, Response, Router } from "express";

import { addHandler, SupportedMethod } from "../../../payloads/response";

export const idpayRouter = Router();

export const addIdPayPrefix = (path: string) => `/idpay-itn${path}`;

export const addIdPayHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(idpayRouter, method, addIdPayPrefix(path), handleRequest);
