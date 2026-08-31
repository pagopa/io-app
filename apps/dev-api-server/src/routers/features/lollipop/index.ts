/** This router serves lollipop API */

import { Router } from "express";

import { lollipopMiddleware } from "../../../middleware/lollipopMiddleware";
import { addHandler } from "../../../payloads/response";
import { getAssertionRef } from "../../../persistence/lollipop";
import { addApiIdentityV1Prefix } from "../../../utils/strings";

export const lollipopRouter = Router();

const handlePostLollipopSign = lollipopMiddleware((_req, res) => {
  res.send({ response: getAssertionRef() });
});

addHandler(
  lollipopRouter,
  "post",
  addApiIdentityV1Prefix("/first-lollipop/sign"),
  handlePostLollipopSign
);
