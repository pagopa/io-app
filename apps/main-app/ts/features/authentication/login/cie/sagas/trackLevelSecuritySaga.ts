import { PublicSession } from "@io-app/api-types/generated/definitions/session_manager/PublicSession";
import * as O from "fp-ts/Option";
import { select } from "typed-redux-saga/macro";

import { idpSelector } from "../../../common/store/selectors";
import { IdpCIE_ID } from "../../hooks/useNavigateToLoginMethod";
import { trackCieIdSecurityLevelMismatch } from "../analytics";
import { cieIDSelectedSecurityLevelSelector } from "../store/selectors";

export function* shouldTrackLevelSecurityMismatchSaga(
  sessionInformation: PublicSession | undefined,
  isActiveLoginSuccess = false
) {
  const selectedSecurityLevel = yield* select(
    cieIDSelectedSecurityLevelSelector
  );
  const idpSelected = yield* select(idpSelector);

  const selectedLevelMismatches =
    sessionInformation != null &&
    O.isSome(idpSelected) &&
    !!selectedSecurityLevel &&
    idpSelected.value.id === IdpCIE_ID.id &&
    !sessionInformation.spidLevel?.includes(selectedSecurityLevel);

  if (selectedLevelMismatches) {
    trackCieIdSecurityLevelMismatch(isActiveLoginSuccess ? "reauth" : "auth");
  }
}
