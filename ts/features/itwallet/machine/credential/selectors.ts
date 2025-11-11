import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { StateFrom } from "xstate";
import { ItwTags } from "../tags";
import { CredentialFormat } from "../../common/utils/itwTypesUtils";
import { ItwCredentialIssuanceMachine } from "./machine";

type MachineSnapshot = StateFrom<ItwCredentialIssuanceMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Loading);

export const selectIsIssuing = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwTags.Issuing);

export const selectCredentialTypeOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.credentialType);

export const selectIssuerConfigurationOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.issuerConf);

export const selectRequestedCredentialOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.requestedCredential);

export const selectCredentialOption = (snapshot: MachineSnapshot) =>
  // At this stage, since the retrieval flow targets credentials under the same `scope` in multiple formats,
  // we continue using the SD-JWT format to display credential details.
  O.fromNullable(
    snapshot.context.credentials?.find(
      ({ format }) => format !== CredentialFormat.MDOC
    )
  );

export const selectFailureOption = (snapshot: MachineSnapshot) =>
  O.fromNullable(snapshot.context.failure);

export const selectIntroductionTextOption = ({ context }: MachineSnapshot) =>
  pipe(
    O.fromNullable(context.credentialType),
    O.chainNullableK(type => context.credentialsCatalogue?.[type]),
    O.chainNullableK(
      metadata => metadata.authentic_sources[0]?.user_information
    )
  );
