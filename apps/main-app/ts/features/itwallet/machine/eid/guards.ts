import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { getFiscalCodeFromCredential } from "../../common/utils/itwClaimsUtils";
import { itwLifecycleIsValidSelector } from "../../lifecycle/store/selectors";
import { Context } from "./context";
import { EidIssuanceEvents } from "./events";

type GuardArgs = {
  context: Context;
  event: EidIssuanceEvents;
};

/**
 * Guard to check whether the user for whom the eID was issued
 * is the same that is currently authenticated in app.
 */
export const issuedEidMatchesAuthenticatedUserGuard = ({
  context
}: GuardArgs) => {
  if (context.deps.env.BYPASS_IDENTITY_MATCH) {
    return true;
  }

  const authenticatedUserFiscalCode = profileFiscalCodeSelector(
    context.deps.store.getState()
  );

  const eidFiscalCode = getFiscalCodeFromCredential(context.eid?.metadata);

  return authenticatedUserFiscalCode === eidFiscalCode;
};

export const isSessionExpiredGuard = ({ event }: GuardArgs) =>
  "error" in event && event.error instanceof ItwSessionExpiredError;

export const hasValidWalletInstanceAttestationGuard = ({
  context
}: GuardArgs) =>
  pipe(
    O.fromNullable(context.walletInstanceAttestation?.jwt),
    O.map(attestation =>
      isWalletInstanceAttestationValid(context.itwVersion, attestation)
    ),
    O.getOrElse(() => false)
  );

export const isWalletValidGuard = ({ context }: GuardArgs) =>
  itwLifecycleIsValidSelector(context.deps.store.getState());
