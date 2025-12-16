import { select } from "typed-redux-saga/macro";
import { GlobalState } from "../../../../store/reducers/types";
import { updateItwAnalyticsProperties } from "../properties/propertyUpdaters";

export function* syncItwAnalyticsProperties() {
  const state: GlobalState = yield* select();
  updateItwAnalyticsProperties(state);
}
