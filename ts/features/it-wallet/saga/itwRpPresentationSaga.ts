import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import { ActionType } from "typesafe-actions";
import {
  Credential,
  createCryptoContextFor
} from "@pagopa/io-react-native-wallet";

import {
  itwRpInitializationEntityValueSelector,
  itwRpInitializationRequestObjectValueSelector
} from "../store/reducers/itwRpInitializationReducer";
import { itwRpPresentation } from "../store/actions/itwRpActions";
import { ItWalletErrorTypes } from "../utils/itwErrorsUtils";
import { ItwCredentialsPidSelector } from "../store/reducers/itwCredentialsReducer";
import { ITW_PID_KEY_TAG } from "../utils/pid";
import { itwWiaSelector } from "../store/reducers/itwWiaReducer";
import { verifyPin } from "./itwSagaUtils";

/*
 * This saga handles the RP presentation.
 * It calls the sendAuthorizationResponse method of the RP solution
 */
export function* handleItwRpPresentationSaga(
  _: ActionType<typeof itwRpPresentation.request>
): SagaIterator {
  try {
    yield* call(verifyPin);

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

    const requestObjectValue = yield* select(
      itwRpInitializationRequestObjectValueSelector
    );

    const pidToken = yield* select(ItwCredentialsPidSelector);

    if (O.isNone(requestObjectValue) || O.isNone(pidToken)) {
      throw new Error("Request object is not defined");
    } else {
      // Create PID crypto context
      const pidCryptoContext = createCryptoContextFor(ITW_PID_KEY_TAG);
      // Retrieve entity configuration for RP
      const maybeEntityConfiguration = yield* select(
        itwRpInitializationEntityValueSelector
      );

      // We suppose the WIA has already been loaded into the state from previous steps
      const maybeWalletInstanceAttestation = yield* select(itwWiaSelector);

      if (O.isNone(maybeWalletInstanceAttestation)) {
        throw new Error("WalletInstanceAttestation is not defined");
      }

      if (O.isNone(maybeEntityConfiguration)) {
        throw new Error("Entity is not defined");
      }

      const walletInstanceAttestation = maybeWalletInstanceAttestation.value;

      const requestObject = requestObjectValue.value;
      const rpEntityConfiguration = maybeEntityConfiguration.value;

      // Submit authorization response
      const result = yield* call(
        Credential.Presentation.sendAuthorizationResponse,
        requestObject,
        rpEntityConfiguration,
        [pidToken.value.credential, claims, pidCryptoContext],
        {
          walletInstanceAttestation
        }
      );

      yield* put(itwRpPresentation.success(result));
    }
  } catch (e) {
    yield* put(
      itwRpPresentation.failure({
        code: ItWalletErrorTypes.RP_PRESENTATION_ERROR
      })
    );
  }
}
