import { fakerIT as faker } from "@faker-js/faker";
import { Router } from "express";

import { addHandler } from "../payloads/response";
import {
  getCustomSession,
  shouldAddLollipopAssertionRef
} from "../payloads/session";
import { getAssertionRef } from "../persistence/lollipop";
import { getRandomValue } from "../utils/random";
import { addApiAuthV1Prefix, addApiV1Prefix } from "../utils/strings";
export const sessionRouter = Router();

addHandler(
  sessionRouter,
  "get",
  addApiAuthV1Prefix("/session"),
  ({ query }, res) => {
    const sessionMaybe = getCustomSession(query);
    if (!sessionMaybe) {
      res.sendStatus(401);
      return;
    }
    res.json({
      ...sessionMaybe.payload,
      ...(shouldAddLollipopAssertionRef(query) && {
        lollipopAssertionRef: getAssertionRef()
      })
    });
  }
);

addHandler(sessionRouter, "get", addApiV1Prefix("/token/support"), (_, res) =>
  res.json({
    access_token: getRandomValue("supportToken", faker.string.uuid(), "global"),
    expires_in: getRandomValue(180, faker.number.int(), "global")
  })
);
