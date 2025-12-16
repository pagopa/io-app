import { select } from "typed-redux-saga/macro";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/lib/function";
import { sequenceT } from "fp-ts/lib/Apply";
import { cieIDSelectedSecurityLevelSelector } from "../store/selectors";
import { idpSelector } from "../../../common/store/selectors";
import { IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";
import { trackCieIdSecurityLevelMismatch } from "../analytics";
import { PublicSession } from "../../../../../../definitions/session_manager/PublicSession";

export function* shouldTrackLevelSecurityMismatchSaga(
  maybeSessionInformation: O.Option<PublicSession>,
  isActiveLoginSuccess: boolean = false
) {
  const selectedSecurityLevel = yield* select(
    cieIDSelectedSecurityLevelSelector
  );
  const idpSelected = yield* select(idpSelector);
  const selectedLevelMismatches = pipe(
    sequenceT(O.Monad)(maybeSessionInformation, idpSelected),
    O.chainNullableK(
      ([session, idp]) =>
        selectedSecurityLevel &&
        idp.id === IdpCIE_ID.id &&
        !session.spidLevel?.includes(selectedSecurityLevel)
    ),
    O.getOrElse(() => false)
  );

  if (selectedLevelMismatches) {
    trackCieIdSecurityLevelMismatch(isActiveLoginSuccess ? "reauth" : "auth");
  }
}
