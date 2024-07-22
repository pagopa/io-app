import { flow, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as RA from "fp-ts/lib/ReadonlyArray";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

export const itwCredentialsSelector = (state: GlobalState) =>
  state.features.itWallet.credentials;

export const itwCredentialsEidSelector = (state: GlobalState) =>
  state.features.itWallet.credentials.eid;

export const itwCredentialByTypeSelector = (type: string) =>
  createSelector(itwCredentialsSelector, ({ eid, credentials }) => {
    if (type === CredentialType.PID) {
      return eid;
    }

    return pipe(
      credentials,
      RA.findFirst(
        flow(
          O.map(cred => cred.credentialType === type),
          O.getOrElse(() => false)
        )
      ),
      O.flatten
    );
  });
