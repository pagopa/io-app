import { StateFrom } from "xstate";

import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import { IdentificationContext } from "./context";
import { ItwEidIssuanceMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwEidIssuanceMachine>;

export const selectIssuanceMode = (snapshot: MachineSnapshot) =>
  snapshot.context.mode || "issuance";

export const selectIssuanceLevel = (snapshot: MachineSnapshot) =>
  snapshot.context.level || "l2";

export const isL3FeaturesEnabledSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.level === "l3";

export const selectEid = (snapshot: MachineSnapshot) => snapshot.context.eid;

export const selectFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

export const isNFCEnabledSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.cieContext?.isNFCEnabled || false;

export const isCIEAuthenticationSupportedSelector = (
  snapshot: MachineSnapshot
) => snapshot.context.cieContext?.isCIEAuthenticationSupported || false;

export const selectIdentification = (snapshot: MachineSnapshot) =>
  snapshot.context.identification;

export const selectCiePin = (snapshot: MachineSnapshot) => {
  const { identification } = snapshot.context;
  return identification?.mode === "ciePin"
    ? (identification as Extract<IdentificationContext, { mode: "ciePin" }>).pin
    : undefined;
};

export const selectAuthUrl = (snapshot: MachineSnapshot) =>
  snapshot.context.authenticationContext?.authUrl;

export const selectMrtdCallbackUrl = (snapshot: MachineSnapshot) =>
  snapshot.context.mrtdContext?.callbackUrl;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

/**
 * The eID context is assigned before the identity-match check completes, so the
 * preview content must wait until the machine reaches a state where it is safe
 * to expose the issued credential.
 */
export const selectCanRenderEidPreview = (snapshot: MachineSnapshot) =>
  snapshot.matches({ Issuance: "DisplayingPreview" }) ||
  snapshot.matches({ Issuance: "StoringCredential" });

export const selectUpgradeFailedCredentials = (
  snapshot: MachineSnapshot
): ReadonlyArray<
  CredentialMetadata & {
    failure?: {
      reason: unknown;
      type: string;
    };
  }
> => snapshot.context.failedCredentials ?? [];

export const selectCredentialType = (snapshot: MachineSnapshot) =>
  snapshot.context.credentialType;
