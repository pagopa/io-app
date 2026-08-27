import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import { StateFrom } from "xstate";

import { RequestObject } from "../../../common/utils/itwTypesUtils";
import { getRemoteCredentialCombination } from "../utils/itwRemotePresentationUtils";
import { ItwRemoteMachine } from "./machine";
import { ItwPresentationTags } from "./tags";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Loading);

export const selectIsSuccess = (snapshot: MachineSnapshot) =>
  snapshot.matches("Success");

export const selectIsClaimsDisclosure = (snapshot: MachineSnapshot) =>
  snapshot.matches("ClaimsDisclosure");

export const selectFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

export const selectPresentationDetails = (snapshot: MachineSnapshot) =>
  snapshot.context.presentationDetails;

export const selectRelyingPartyData = (snapshot: MachineSnapshot) =>
  snapshot.context.rpConf?.federation_entity;

export const selectUserSelectedOptionalCredentials = (
  snapshot: MachineSnapshot
) => snapshot.context.selectedOptionalCredentials;

// This selector returns a decoded but not validated Request Object.
// It is used in scenarios where, due to a validation error during Request Object processing,
// it becomes necessary to extract certain internal information (e.g., `response_uri`)
// in order to communicate the details of the failed operation to the Relying Party.
export const selectUnverifiedRequestObject = (
  snapshot: MachineSnapshot
): null | RequestObject => {
  const { requestObjectEncodedJwt } = snapshot.context;
  return requestObjectEncodedJwt
    ? (decodeJwt(requestObjectEncodedJwt).payload as RequestObject)
    : null;
};
export const selectRedirectUri = (snapshot: MachineSnapshot) =>
  snapshot.context.redirectUri;

/**
 * Selector to get the combination of credential types involved in the presentation, used for analytics purposes.
 */
export const selectRemoteCredentialCombination = (
  snapshot: MachineSnapshot
) => {
  const { presentationDetails } = snapshot.context;
  return presentationDetails
    ? getRemoteCredentialCombination(presentationDetails)
    : null;
};

export const selectFlowType = (snapshot: MachineSnapshot) =>
  snapshot.context.flowType;
