import { StateFrom } from "xstate";
import * as O from "fp-ts/Option";
import { constNull, pipe } from "fp-ts/lib/function";
import { decode as decodeJwt } from "@pagopa/io-react-native-jwt";
import { RequestObject } from "../../../common/utils/itwTypesUtils";
import { ItwRemoteMachine } from "./machine";
import { ItwPresentationTags } from "./tags";

type MachineSnapshot = StateFrom<ItwRemoteMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Loading);

export const selectIsSuccess = (snapshot: MachineSnapshot) =>
  snapshot.matches("Success");

export const selectIsClaimsDisclosure = (snapshot: MachineSnapshot) =>
  snapshot.matches("ClaimsDisclosure");

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);

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
export const selectUnverifiedRequestObject = (snapshot: MachineSnapshot) =>
  pipe(
    O.fromNullable(snapshot.context.requestObjectEncodedJwt),
    O.map(decodeJwt),
    O.map(jwt => jwt.payload as RequestObject),
    O.getOrElseW(constNull)
  );
export const selectRedirectUri = (snapshot: MachineSnapshot) =>
  snapshot.context.redirectUri;
