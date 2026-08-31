import { fakerIT as faker } from "@faker-js/faker";
import { NextFunction, Request, Response } from "express-serve-static-core";

import { ioDevServerConfig } from "../config";

/**
 * if the response error is defined as a global config
 * this middleware returns an error from those ones defined
 * if the current change is less or equal than one defined
 * @param _
 * @param res
 * @param next
 */
export const errorMiddleware = (
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (ioDevServerConfig.global.responseError === undefined) {
    next();
    return;
  }
  const random = faker.number.float({ min: 0, max: 1, fractionDigits: 2 });
  const { chance, codes } = ioDevServerConfig.global.responseError;
  // out of the chance, do nothing
  if (random > chance) {
    next();
    return;
  }
  // pick an error code randomly
  const errorCode = faker.helpers.arrayElement(codes);
  res.sendStatus(errorCode);
};
