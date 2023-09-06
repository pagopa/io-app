import { SagaIterator } from "redux-saga";
import { call, put, select, take } from "typed-redux-saga/macro";
import { sign } from "@pagopa/io-react-native-crypto";
import { SignJWT } from "@pagopa/io-react-native-jwt";
import * as O from "fp-ts/lib/Option";
import { ActionType } from "typesafe-actions";
import {
  RelyingPartySolution,
  WalletInstanceAttestation
} from "@pagopa/io-react-native-wallet";

import {
  itwRpInitializationEntityValueSelector,
  itwRpInitializationRequestObjectValueSelector
} from "../store/reducers/itwRpInitializationReducer";
import { itwRpPresentation } from "../store/actions/itwRpActions";
import { ItWalletErrorTypes } from "../utils/errors/itwErrors";
import { ITW_WIA_KEY_TAG } from "../utils/wia";
import { ItwCredentialsPidSelector } from "../store/reducers/itwCredentialsReducer";
import { itwWiaRequest } from "../store/actions/itwWiaActions";

/*
 * This saga handles the RP presentation.
 * It calls the sendAuthorizationResponse method of the RP solution
 * to send the VP token to the RP
 */
export function* handleItwRpPresentationSaga(
  action: ActionType<typeof itwRpPresentation.request>
): SagaIterator {
  try {
    const { authReqUrl } = action.payload;

    // TODO: this claims should be selected by user
    const claims = [
      "unique_id",
      "given_name",
      "family_name",
      "birthdate",
      "place_of_birth",
      "tax_id_number",
      "evidence"
    ];

    const requestObject = yield* select(
      itwRpInitializationRequestObjectValueSelector
    );
    const pidToken = yield* select(ItwCredentialsPidSelector);

    // Get WIA
    yield* put(itwWiaRequest.request());
    const wia = yield* take(itwWiaRequest.success);

    if (O.isNone(requestObject) || O.isNone(pidToken)) {
      throw new Error("Request object is not defined");
    } else {
      const RP = new RelyingPartySolution(authReqUrl, wia.payload);
      const decodedWia = yield* call(
        WalletInstanceAttestation.decode,
        wia.payload
      );

      const walletInstanceId = new URL(
        "instance/" + decodedWia.payload.sub,
        decodedWia.payload.iss
      ).href;

      const { vp_token: unsignedVpToken, presentation_submission } =
        yield* call(
          RP.prepareVpToken,
          requestObject.value,
          walletInstanceId,
          [pidToken.value.credential, claims],
          decodedWia.payload.cnf.jwk.kid
        );

      const signature = yield* call(sign, unsignedVpToken, ITW_WIA_KEY_TAG);
      const vpToken = yield* call(
        SignJWT.appendSignature,
        unsignedVpToken,
        signature
      );

      const entity = yield* select(itwRpInitializationEntityValueSelector);

      if (O.isNone(entity)) {
        throw new Error("Entity is not defined");
      } else {
        // Submit authorization response
        const result = yield* call(
          RP.sendAuthorizationResponse,
          requestObject.value,
          vpToken,
          presentation_submission,
          entity.value
        );

        yield* put(itwRpPresentation.success(result));
      }
    }
  } catch (e) {
    yield* put(
      itwRpPresentation.failure({
        code: ItWalletErrorTypes.RP_PRESENTATION_ERROR
      })
    );
  }
}
