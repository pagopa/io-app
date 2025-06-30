import { SdJwt } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { MigrationManifest, PersistedState } from "redux-persist";

type MigrationState = PersistedState & Record<string, any>;

export const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = 2;

export const itwCredentialsStateMigrations: MigrationManifest = {
  // Version 0
  // Add optional `storedStatusAttestation` field
  "0": (state: MigrationState) => {
    const addStoredStatusAttestation = (credential: Record<string, any>) => ({
      ...credential,
      storedStatusAttestation: undefined
    });
    return {
      ...state,
      eid: pipe(state.eid, O.map(addStoredStatusAttestation)),
      credentials: state.credentials.map(
        (credential: O.Option<Record<string, any>>) =>
          pipe(credential, O.map(addStoredStatusAttestation))
      )
    };
  },

  // Version 1
  // Add issuance and expiration dates to stored credentials
  "1": (state: MigrationState) => {
    const addIatExpProperties = (credential: Record<string, any>) => {
      const { disclosures, sdJwt } = SdJwt.decode(credential.credential);
      const iatDisclosure = disclosures.find(
        ({ decoded }) => decoded[1] === "iat"
      );
      const exp = sdJwt.payload.exp
        ? new Date(sdJwt.payload.exp * 1000)
        : new Date();
      return {
        ...credential,
        jwt: {
          expiration: exp.toISOString(),
          issuedAt:
            iatDisclosure && typeof iatDisclosure.decoded[2] === "number"
              ? new Date(iatDisclosure.decoded[2] * 1000).toISOString()
              : undefined
        }
      };
    };
    return {
      ...state,
      eid: pipe(state.eid, O.map(addIatExpProperties)),
      credentials: state.credentials.map(
        (credential: O.Option<Record<string, any>>) =>
          pipe(credential, O.map(addIatExpProperties))
      )
    };
  },

  // Version 2
  // Migrate store to key:credential Record and removes Option
  "2": (state: MigrationState) => {
    const mapCredential = (credential: O.Option<Record<string, any>>) =>
      pipe(
        credential,
        O.map(c => ({ [c.credentialType]: c })),
        O.getOrElse(() => ({}))
      );

    const { eid, credentials, ...other } = state;

    const credentialsByType = credentials.reduce(
      (
        acc: { [type: string]: Record<string, any> },
        c: O.Option<Record<string, any>>
      ) => ({ ...acc, ...mapCredential(c) }),
      {} as { [type: string]: Record<string, any> }
    );

    return {
      ...other,
      credentials: {
        ...mapCredential(eid),
        ...credentialsByType
      }
    };
  }
};
