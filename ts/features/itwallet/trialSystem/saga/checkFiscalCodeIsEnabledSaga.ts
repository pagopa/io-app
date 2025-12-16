import { SagaIterator } from "redux-saga";
import { call, select } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config.ts";
import { assert } from "../../../../utils/assert.ts";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { createItWalletClient } from "../../api/client.ts";
import { selectItwEnv } from "../../common/store/selectors/environment.ts";
import { getEnv } from "../../common/utils/environment.ts";
import { handleGetWhitelistedStatus } from "./handleGetWhitelistedStatus.ts";

/**
 * Saga responsible to check whether the fiscal code is enabled or not, for the L3 features.
 */
export function* checkFiscalCodeEnabledSaga(): SagaIterator {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  const { WALLET_PROVIDER_BASE_URL } = getEnv(yield* select(selectItwEnv));

  const client = createItWalletClient(
    sessionToken,
    WALLET_PROVIDER_BASE_URL,
    apiUrlPrefix
  );
  yield* call(handleGetWhitelistedStatus, client, sessionToken);
}
