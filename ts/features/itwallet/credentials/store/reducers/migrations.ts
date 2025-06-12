import { SdJwt } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { MigrationManifest } from "redux-persist";

export const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = 1;

export const itwCredentialsStateMigrations: MigrationManifest = {
  // Version 0
  // Add optional `storedStatusAttestation` field
  "0": (state: any) => {
    const addStoredStatusAttestation = (credential: any) => ({
      ...credential,
      storedStatusAttestation: undefined
    });
    return {
      ...state,
      eid: pipe(state.eid, O.map(addStoredStatusAttestation)),
      credentials: state.credentials.map((credential: any) =>
        pipe(credential, O.map(addStoredStatusAttestation))
      )
    };
  },

  // Version 1
  // Add issuance and expiration dates to stored credentials
  "1": (state: any) => {
    const addIatExpProperties = (credential: any) => {
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
      credentials: state.credentials.map((credential: any) =>
        pipe(credential, O.map(addIatExpProperties))
      )
    };
  }
};
