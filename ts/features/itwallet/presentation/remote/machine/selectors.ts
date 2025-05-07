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

export const selectUnverifiedRequestObject = (snapshot: MachineSnapshot) =>
  pipe(
    O.fromNullable(snapshot.context.requestObjectEncodedJwt),
    O.map(decodeJwt),
    O.map(jwt => jwt.payload as RequestObject),
    O.getOrElseW(constNull)
  );
