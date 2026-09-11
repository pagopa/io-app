import { ItwSessionExpiredError } from "../../api/client";
import { isWalletInstanceAttestationValid } from "../../common/utils/itwAttestationUtils";
import { itwCredentialsEidStatusSelector } from "../../credentials/store/selectors";
import { itwCredentialIntroContentSelector } from "../../credentialsCatalogue/store/selectors";
import { Context } from "./context";
import { CredentialIssuanceEvents } from "./events";

type GuardArgs = {
  context: Context;
  event: CredentialIssuanceEvents;
};

export const isSessionExpiredGuard = ({ event }: GuardArgs) =>
  "error" in event && event.error instanceof ItwSessionExpiredError;

export const hasValidWalletInstanceAttestationGuard = ({
  context
}: GuardArgs) => {
  const attestation = context.walletInstanceAttestation?.jwt;
  if (!attestation) {
    return false;
  }
  return isWalletInstanceAttestationValid(context.deps.itwVersion, attestation);
};

export const isEidExpiredGuard = ({ context }: GuardArgs) => {
  const eidStatus = itwCredentialsEidStatusSelector(
    context.deps.store.getState()
  );

  return eidStatus === "jwtExpired";
};

export const hasCredentialIntroContentGuard = ({ context }: GuardArgs) => {
  if (!context.credentialType) {
    return false;
  }
  const credentialIntroContent = itwCredentialIntroContentSelector(
    context.credentialType
  )(context.deps.store.getState());
  return Boolean(credentialIntroContent);
};
