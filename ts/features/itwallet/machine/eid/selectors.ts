import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { StateFrom } from "xstate";
import { StoredCredential } from "../../common/utils/itwTypesUtils";
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
    O.toUndefined
  );

export const selectAuthUrlOption = (snapshot: MachineSnapshot) =>
  pipe(
    snapshot.context.authenticationContext,
    O.fromNullable,
    O.map(x => x.authUrl)
  );

export const selectMrtdCallbackUrl = (snapshot: MachineSnapshot) =>
  snapshot.context.mrtdContext?.callbackUrl;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectUpgradeFailedCredentials = (snapshot: MachineSnapshot) =>
  pipe(
    snapshot.context.failedCredentials,
    O.fromNullable,
    O.getOrElse(
      () =>
        [] as ReadonlyArray<
          StoredCredential & {
            failure?: {
              type: string;
              reason: unknown;
            };
          }
        >
    )
  );

export const selectCredentialType = (snapshot: MachineSnapshot) =>
  snapshot.context.credentialType;

export const selectLegacyCredentialsCount = (snapshot: MachineSnapshot) =>
  snapshot.context.legacyCredentials.length;
