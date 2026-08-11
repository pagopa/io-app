import { Request, Response, Router } from "express";

import { addHandler, SupportedMethod } from "../../../payloads/response";

export const walletRouter = Router();

export const PAYMENT_WALLET_PREFIX = "/io-payment-wallet/v1";
export const ECOMMERCE_PREFIX = "/ecommerce/io/v2";
export const NOTICES_PREFIX = "/bizevents/notices-service-jwt/v1";
export const PLATFORM_PREFIX = "/session-wallet/v1";

export const addPaymentWalletPrefix = (path: string) =>
  `${PAYMENT_WALLET_PREFIX}${path}`;

export const addECommercePrefix = (path: string) =>
  `${ECOMMERCE_PREFIX}${path}`;

export const addNoticesPrefix = (path: string) => `${NOTICES_PREFIX}${path}`;

export const addPlatformPrefix = (path: string) => `${PLATFORM_PREFIX}${path}`;

export const addPaymentWalletHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) =>
  addHandler(walletRouter, method, addPaymentWalletPrefix(path), handleRequest);

export const addPaymentHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(walletRouter, method, addECommercePrefix(path), handleRequest);

export const addNoticesHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(walletRouter, method, addNoticesPrefix(path), handleRequest);

export const addPlatformHandler = (
  method: SupportedMethod,
  path: string,
  handleRequest: (request: Request, response: Response) => void
) => addHandler(walletRouter, method, addPlatformPrefix(path), handleRequest);
