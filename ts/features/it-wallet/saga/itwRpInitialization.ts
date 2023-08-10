import { SagaIterator } from "redux-saga";
import { call, put } from "typed-redux-saga/macro";
import { getPublicKey, sign } from "@pagopa/io-react-native-crypto";
import { SignJWT } from "@pagopa/io-react-native-jwt";
import { ActionType } from "typesafe-actions";
import { itwRpInitialization } from "../store/actions/itwRpActions";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { ITW_WIA_KEY_TAG } from "../utils/wia";

/*
 * This saga handles the RP initialization.
 * It calls the getRequestObject method of the RP solution
 */
export function* handleItwRpInitializationSaga(
  action: ActionType<typeof itwRpInitialization.request>
): SagaIterator {
  const { RP, authReqUrl } = action.payload;

  const pk = yield* call(getPublicKey, ITW_WIA_KEY_TAG);

  try {
    const unsignedDPoP = yield* call(
      RP.getUnsignedWalletInstanceDPoP,
      pk,
      authReqUrl
    );

    const signedDPoP = yield* call(sign, unsignedDPoP, ITW_WIA_KEY_TAG);

    const signedPayload = yield* call(
      SignJWT.appendSignature,
      unsignedDPoP,
      signedDPoP
    );

    const entity = yield* call(RP.getEntityConfiguration);

    const requestObject = yield* call(
      RP.getRequestObject,
      signedPayload,
      entity
    );

    yield* put(itwRpInitialization.success({ requestObject, entity }));
  } catch (e) {
    yield* put(
      itwRpInitialization.failure({
        code: ItWalletErrorTypes.RP_INITIALIZATION_ERROR
      })
    );
  }
}
