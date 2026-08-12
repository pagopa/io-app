/* eslint-disable functional/immutable-data */
import { Subscription } from "@io-app/api-types/generated/definitions/trial_system/Subscription";
import { SubscriptionStateEnum } from "@io-app/api-types/generated/definitions/trial_system/SubscriptionState";
import { TrialId } from "@io-app/api-types/generated/definitions/trial_system/TrialId";
import { Router } from "express";

import { ioDevServerConfig } from "../../../config";
import { addHandler } from "../../../payloads/response";
import { addApiV1Prefix } from "../../../utils/strings";
export const trialSystemRouter = Router();

const addPrefix = (path: string) => addApiV1Prefix(`/trials${path}`);

/**
 * Undefined means that the user never subscribed to the trial, otherwise it is set to a Subscription state
 */
const trials: Record<TrialId, Subscription | undefined> = {};

const loadTrials = () =>
  Object.entries(ioDevServerConfig.features.trials || {})?.forEach(
    ([trialId, state]) => {
      if (state) {
        trials[trialId as TrialId] = {
          trialId: trialId as TrialId,
          state,
          createdAt: new Date()
        };
      } else {
        return (trials[trialId as TrialId] = state); // We set it to undefined, it means that the user never subscribed to the trial
      }
    }
  );

addHandler(
  trialSystemRouter,
  "post",
  addPrefix("/:trialId/subscriptions"),
  (req, res) => {
    const trialId = req.params.trialId as TrialId;
    if (!(trialId in trials)) {
      return res.sendStatus(404); // trial not found in the configuration
    }

    const currentTrial = trials[trialId];
    if (
      currentTrial &&
      currentTrial.state !== SubscriptionStateEnum.UNSUBSCRIBED
    ) {
      // if current trial already has a value and it's not unsubscribed then return 409
      return res.status(409).json({
        detail: "The resource already exists.",
        title: "Conflict"
      });
    }

    trials[req.params.trialId as TrialId] = {
      trialId: req.params.trialId as TrialId,
      state: SubscriptionStateEnum.SUBSCRIBED,
      createdAt: new Date()
    };
    res.status(201).json({
      trialId: req.params.trialId as TrialId,
      state: SubscriptionStateEnum.SUBSCRIBED,
      createdAt: new Date()
    } as Subscription);
  }
);

addHandler(
  trialSystemRouter,
  "get",
  addPrefix("/:trialId/subscriptions"),
  (req, res) => {
    const currentTrial = trials[req.params.trialId as TrialId];

    if (currentTrial) {
      return res.status(200).json(currentTrial);
    }
    res.sendStatus(404);
  }
);

loadTrials();
