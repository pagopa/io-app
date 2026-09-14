import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { NextFunction, Request, Response } from "express";

export const delayer =
  (delay: Millisecond) => (_: Request, __: Response, next: NextFunction) => {
    setTimeout(next, delay);
  };
