import { SagaIterator } from "redux-saga";
import { call, select } from "typed-redux-saga/macro";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { assert } from "../../../../utils/assert.ts";
import { createItWalletClient } from "../../api/client.ts";
import { apiUrlPrefix } from "../../../../config.ts";
import { handleGetWhitelistedStatus } from "./handleGetWhitelistedStatus.ts";

/**
 * Saga responsible to check whether the fiscal code is enabled or not, for the L3 features.
 */
export function* checkFiscalCodeEnabledSaga(): SagaIterator {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");
  const client = createItWalletClient(apiUrlPrefix, sessionToken);
  yield* call(handleGetWhitelistedStatus, client, sessionToken);
}
