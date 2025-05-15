import * as E from "fp-ts/Either";
import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { ItWalletClient } from "../../api/client.ts";
import { itwSetFiscalCodeWhitelisted } from "../../common/store/actions/preferences.ts";
import { SessionToken } from "../../../../types/SessionToken.ts";

/**
 * Saga that handles the retrieval of the whitelisted status for the fiscal code.
 * It checks if the fiscal code is whitelisted and updates the L3 enabled state accordingly.
 * @param client - The IT Wallet client used to make the API call.
 * @param sessionToken - The session token used for authentication.
 */
export function* handleGetWhitelistedStatus(
  client: ItWalletClient,
  sessionToken: SessionToken
): SagaIterator {
  try {
    const response = yield* call(client.isFiscalCodeWhitelisted, {
      Bearer: sessionToken
    });
    if (E.isRight(response) && response.right.status === 200) {
      const { whitelisted } = response.right.value;
      yield* put(itwSetFiscalCodeWhitelisted(whitelisted));
    } else {
      yield* put(itwSetFiscalCodeWhitelisted(false));
    }
  } catch (e) {
    yield* put(itwSetFiscalCodeWhitelisted(false));
  }
}
