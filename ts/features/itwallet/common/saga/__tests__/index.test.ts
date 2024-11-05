import { expectSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { DeepPartial } from "redux";
import * as matchers from "redux-saga-test-plan/matchers";
import { handleTrialSystemSubscription } from "../index";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  trialSystemActivationStatus,
  trialSystemActivationStatusUpsert
} from "../../../../trialSystem/store/actions";
import { SubscriptionStateEnum } from "../../../../../../definitions/trial_system/SubscriptionState";
import {
  trialStatusPotSelector,
  trialStatusSelector
} from "../../../../trialSystem/store/reducers";
import { TrialId } from "../../../../../../definitions/trial_system/TrialId";
import { TrialSystemError } from "../../../../trialSystem/utils/error";

describe("handleTrialSystemSubscription", () => {
  it("should handle trial system subscription correctly when the endpoint returns 404", async () => {
    const trialId = "baz" as TrialId;
    const error = new TrialSystemError(
      "User not found",
      "TRIAL_SYSTEM_USER_NOT_FOUND"
    );
    const state = pot.noneError(error);
    const store: DeepPartial<GlobalState> = {
      trialSystem: {
        [trialId]: state
      }
    };
    return expectSaga(handleTrialSystemSubscription)
      .withState(store)
      .put(trialSystemActivationStatus.request(trialId))
      .dispatch(
        trialSystemActivationStatus.failure({
          trialId,
          error
        })
      )
      .take([
        trialSystemActivationStatus.success,
        trialSystemActivationStatus.failure
      ])
      .provide([[matchers.select(trialStatusPotSelector), state]])
      .put(trialSystemActivationStatusUpsert.request(trialId))
      .run();
  });

  it("shouldn't do anything if the user is already subscribed", async () => {
    const trialId = "baz" as TrialId;
    const state = SubscriptionStateEnum.SUBSCRIBED;
    const store: DeepPartial<GlobalState> = {
      trialSystem: {
        [trialId]: pot.some(state)
      }
    };
    return expectSaga(handleTrialSystemSubscription)
      .withState(store)
      .put(trialSystemActivationStatus.request(trialId))
      .dispatch(
        trialSystemActivationStatus.success({
          trialId,
          state,
          createdAt: new Date()
        })
      )
      .take([
        trialSystemActivationStatus.success,
        trialSystemActivationStatus.failure
      ])
      .provide([[matchers.select(trialStatusSelector), state]])
      .not.put(trialSystemActivationStatusUpsert.request(trialId))
      .run();
  });

  it("shouldn't do anything if the user is active", async () => {
    const trialId = "baz" as TrialId;
    const state = SubscriptionStateEnum.ACTIVE;
    const store: DeepPartial<GlobalState> = {
      trialSystem: {
        [trialId]: pot.some(state)
      }
    };
    return expectSaga(handleTrialSystemSubscription)
      .withState(store)
      .put(trialSystemActivationStatus.request(trialId))
      .dispatch(
        trialSystemActivationStatus.success({
          trialId,
          state,
          createdAt: new Date()
        })
      )
      .take([
        trialSystemActivationStatus.success,
        trialSystemActivationStatus.failure
      ])
      .provide([[matchers.select(trialStatusSelector), state]])
      .not.put(trialSystemActivationStatusUpsert.request(trialId))
      .run();
  });

  it("shouldn't do anything if the user is disabled", async () => {
    const trialId = "baz" as TrialId;
    const state = SubscriptionStateEnum.DISABLED;
    const store: DeepPartial<GlobalState> = {
      trialSystem: {
        [trialId]: pot.some(state)
      }
    };
    return expectSaga(handleTrialSystemSubscription)
      .withState(store)
      .put(trialSystemActivationStatus.request(trialId))
      .dispatch(
        trialSystemActivationStatus.success({
          trialId,
          state,
          createdAt: new Date()
        })
      )
      .take([
        trialSystemActivationStatus.success,
        trialSystemActivationStatus.failure
      ])
      .provide([[matchers.select(trialStatusSelector), state]])
      .not.put(trialSystemActivationStatusUpsert.request(trialId))
      .run();
  });

  it("shouldn't do anything if an error occurs", async () => {
    const trialId = "baz" as TrialId;
    const state = SubscriptionStateEnum.UNSUBSCRIBED;
    const store: DeepPartial<GlobalState> = {
      trialSystem: {
        [trialId]: pot.some(state)
      }
    };
    return expectSaga(handleTrialSystemSubscription)
      .withState(store)
      .put(trialSystemActivationStatus.request(trialId))
      .dispatch(
        trialSystemActivationStatus.failure({
          trialId,
          error: new Error("foo")
        })
      )
      .take([
        trialSystemActivationStatus.success,
        trialSystemActivationStatus.failure
      ])
      .provide([[matchers.select(trialStatusSelector), state]])
      .not.put(trialSystemActivationStatusUpsert.request(trialId))
      .run();
  });
});
