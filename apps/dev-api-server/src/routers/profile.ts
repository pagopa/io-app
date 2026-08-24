import { Router } from "express";

import { addHandler } from "../payloads/response";
import {
  getProfile,
  resetUserProfile,
  updateProfile
} from "../persistence/profile/profile";
import {
  getUserChoice,
  resetUserChoice,
  userDataProcessingDelete,
  userDataProcessingUpdate
} from "../persistence/profile/userMetadata";
import { addApiIdentityV1Prefix } from "../utils/strings";
import { RouteHandler } from "../utils/types";

export const profileRouter = Router();
const dataProcessingUrl = "/user-data-processing/:choice";

const handleGetProfile: RouteHandler = (_, res) => {
  const { status, payload } = getProfile();
  res.status(status).json(payload);
};

const handlePostProfile: RouteHandler = (req, res) => {
  const { status, payload } = updateProfile(req);
  res.status(status).json(payload);
};

const handleGetUserDataProcessing: RouteHandler = (req, res) => {
  const choice = getUserChoice(req);
  res.status(choice.status).json(choice.payload);
};

const handlePostUserDataProcessing: RouteHandler = (req, res) => {
  const { status, payload } = userDataProcessingUpdate(req);
  res.status(status).json(payload);
};

const handleDeleteUserDataProcessing: RouteHandler = (req, res) => {
  const { status, payload } = userDataProcessingDelete(req);
  res.status(status).json(payload);
};

const handlePostEmailValidationProcess: RouteHandler = (_, res) => {
  res.sendStatus(202);
};

// --- Route registrations ---

addHandler(
  profileRouter,
  "get",
  addApiIdentityV1Prefix("/profile"),
  handleGetProfile
);

addHandler(
  profileRouter,
  "post",
  addApiIdentityV1Prefix("/profile"),
  handlePostProfile
);

addHandler(
  profileRouter,
  "get",
  addApiIdentityV1Prefix(dataProcessingUrl),
  handleGetUserDataProcessing
);

addHandler(
  profileRouter,
  "post",
  addApiIdentityV1Prefix("/user-data-processing"),
  handlePostUserDataProcessing
);

addHandler(
  profileRouter,
  "delete",
  addApiIdentityV1Prefix(dataProcessingUrl),
  handleDeleteUserDataProcessing
);

addHandler(
  profileRouter,
  "post",
  addApiIdentityV1Prefix("/email-validation-process"),
  handlePostEmailValidationProcess
);

// reset function
export const resetProfile = () => {
  resetUserChoice();
  resetUserProfile();
};
