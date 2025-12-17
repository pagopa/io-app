import { select } from "typed-redux-saga/macro";
import { GlobalState } from "../../../../store/reducers/types";
import { updateItwAnalyticsProperties } from "../properties/propertyUpdaters";

/**
 * Saga that performs a full sync of all ITW analytics properties
 * (Profile + Super) using the current state.
 */
export function* syncItwAnalyticsProperties() {
  const state: GlobalState = yield* select();
  updateItwAnalyticsProperties(state);
}
