import { StateFrom } from "xstate";

import { CredentialFormat } from "../../common/utils/itwTypesUtils";
import { ItwTags } from "../tags";
import { ItwCredentialIssuanceMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectIsIssuing = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Issuing);

export const selectCredentialType = (snapshot: MachineSnapshot) =>
  snapshot.context.credentialType;

export const selectIssuerConfiguration = (snapshot: MachineSnapshot) =>
  snapshot.context.issuerConf;

export const selectRequestedCredential = (snapshot: MachineSnapshot) =>
  snapshot.context.requestedCredential;

export const selectEvaluatedDcqlQuery = (snapshot: MachineSnapshot) =>
  snapshot.context.evaluatedDcqlQuery;

export const selectRequiredClaims = (snapshot: MachineSnapshot) =>
  snapshot.context.evaluatedDcqlQuery?.flatMap(({ requiredDisclosures }) =>
    requiredDisclosures.map(({ name }) => name)
  );

export const selectCredential = (snapshot: MachineSnapshot) => {
  // At this stage the retrieval flow targets credentials under the same `scope` in multiple formats:
  // prefer the SD-JWT format to display credential details, but fall back to the first available
  // credential for mso_mdoc-only credentials (e.g. proof of age obtained in batch), which have no
  // SD-JWT copy and would otherwise leave the preview stuck on loading.
  const credentials = snapshot.context.credentials;
  return (
    credentials?.find(
      ({ metadata }) => metadata.format !== CredentialFormat.MDOC
    ) ?? credentials?.[0]
  );
};

export const selectFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

export const selectResolvedCredentialOffer = (snapshot: MachineSnapshot) =>
  snapshot.context.resolvedCredentialOffer;

export const selectHasResolvedCredentialOffer = (snapshot: MachineSnapshot) =>
  snapshot.context.resolvedCredentialOffer !== undefined;
