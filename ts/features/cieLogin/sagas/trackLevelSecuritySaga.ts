import { select } from "typed-redux-saga/macro";
import * as O from "fp-ts/Option";
import { cieIDSelectedSecurityLevelSelector } from "../store/selectors";
import { idpSelector } from "../../../store/reducers/authentication";
import { IdpCIE_ID } from "../../../hooks/useNavigateToLoginMethod";
import { trackCieIdSecurityLevelMismatch } from "../analytics";
import { PublicSession } from "../../../../definitions/session_manager/PublicSession";

export function* shouldTrackLevelSecurityMismatch(
  maybeSessionInformation: O.Option<PublicSession>
) {
  const selectedSecurityLevel = yield* select(
    cieIDSelectedSecurityLevelSelector
  );
  const idpSelected = yield* select(idpSelector);

  if (
    O.isSome(maybeSessionInformation) &&
    O.isSome(idpSelected) &&
    selectedSecurityLevel &&
    idpSelected.value.id === IdpCIE_ID.id &&
    !maybeSessionInformation.value.spidLevel?.includes(selectedSecurityLevel)
  ) {
    trackCieIdSecurityLevelMismatch();
  }
}
