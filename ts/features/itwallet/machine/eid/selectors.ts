import { StateFrom } from "xstate";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { ItwTags } from "../tags";
import { ItwEidIssuanceMachine } from "./machine";
import { IdentificationContext } from "./context";

type MachineSnapshot = StateFrom<ItwEidIssuanceMachine>;

export const selectEidOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.eid);

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);

export const isNFCEnabledSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.cieContext?.isNFCEnabled || false;

export const isCIEAuthenticationSupportedSelector = (
  snapshot: MachineSnapshot
) => snapshot.context.cieContext?.isCIEAuthenticationSupported || false;

export const selectIdentification = (snapshot: MachineSnapshot) =>
  snapshot.context.identification;

export const selectCiePin = (snapshot: MachineSnapshot) =>
  pipe(
    snapshot.context.identification,
    O.fromNullable,
    O.filter(x => x.mode === "ciePin"),
    O.map(x => (x as Extract<IdentificationContext, { mode: "ciePin" }>).pin),
    O.getOrElse(() => "")
  );

export const selectAuthUrlOption = (snapshot: MachineSnapshot) =>
  pipe(
    snapshot.context.authenticationContext,
    O.fromNullable,
    O.map(x => x.authUrl)
  );

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectIsCieIdEidRequest = (snapshot: MachineSnapshot) =>
  snapshot.context.identification?.mode === "cieId";
