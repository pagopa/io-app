import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { sign } from "@pagopa/io-react-native-crypto";
import { SignJWT } from "@pagopa/io-react-native-jwt";
import { ActionType } from "typesafe-actions";
import * as O from "fp-ts/lib/Option";
import { WalletInstanceAttestation } from "@pagopa/io-react-native-wallet";
import { itwRpInitialization } from "../store/actions/itwRpActions";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { ITW_WIA_KEY_TAG } from "../utils/wia";
import { itwWiaSelector } from "../store/reducers/itwWiaReducer";

/*
 * This saga handles the RP initialization.
 * It calls the getRequestObject method of the RP solution
 */
export function* handleItwRpInitializationSaga(
  action: ActionType<typeof itwRpInitialization.request>
): SagaIterator {
  try {
    const { RP, authReqUrl } = action.payload;
    const wia = yield* select(itwWiaSelector);
    if (O.isNone(wia)) {
      throw new Error(); // TODO: Better error mapping
    } else {
      const decodedWIA = yield* call(
        WalletInstanceAttestation.decode,
        wia.value
      );
      const unsignedDPoP = yield* call(
        RP.getUnsignedWalletInstanceDPoP,
        decodedWIA.payload.cnf.jwk,
        authReqUrl
      );
      const signedDPoP = yield* call(sign, unsignedDPoP, ITW_WIA_KEY_TAG);
      const entity = yield* call(RP.getEntityConfiguration);
      const signedPayload = yield* call(
        SignJWT.appendSignature,
        unsignedDPoP,
        signedDPoP
      );
      const requestObject = yield* call(
        RP.getRequestObject,
        signedPayload,
        authReqUrl,
        entity
      );
      yield* put(itwRpInitialization.success({ requestObject, entity }));
    }
  } catch (e) {
    yield* put(
      itwRpInitialization.failure({
        code: ItWalletErrorTypes.RP_INITIALIZATION_ERROR
      })
    );
  }
}
