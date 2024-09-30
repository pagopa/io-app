import * as O from "fp-ts/lib/Option";
import { MigrationManifest, PersistPartial } from "redux-persist";
import { pipe } from "fp-ts/lib/function";
import { SdJwt } from "@pagopa/io-react-native-wallet";
import { ItwCredentialsState } from "../../../credentials/store/reducers";
import { StoredCredential } from "../../utils/itwTypesUtils";
import { getSafeISODate } from "../../utils/itwClaimsUtils";

export const CURRENT_REDUX_ITW_STORE_VERSION = -1;

export const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = 1;
export const itwCredentialsStateMigrations: MigrationManifest = {
  "0": (state): ItwCredentialsState & PersistPartial => {
    // Version 0
    // Add optional `storedStatusAttestation` field
    const addStoredStatusAttestation = (
      credential: StoredCredential
    ): StoredCredential => ({
      ...credential,
      storedStatusAttestation: undefined
    });
    const prevState = state as ItwCredentialsState & PersistPartial;
    return {
      ...prevState,
      eid: pipe(prevState.eid, O.map(addStoredStatusAttestation)),
      credentials: prevState.credentials.map(credential =>
        pipe(credential, O.map(addStoredStatusAttestation))
      )
    };
  },

  "1": (state): ItwCredentialsState & PersistPartial => {
    // Version 1
    // Add issuance and expiration dates to stored credentials
    const addIatExpProperties = (
      credential: StoredCredential
    ): StoredCredential => {
      const { disclosures, sdJwt } = SdJwt.decode(credential.credential);
      const iatDisclosure = disclosures.find(
        ({ decoded }) => decoded[1] === "iat"
      );
      return {
        ...credential,
        expiration: getSafeISODate(new Date(sdJwt.payload.exp * 1000)),
        issuedAt: getSafeISODate(
          iatDisclosure
            ? new Date((iatDisclosure.decoded[2] as number) * 1000)
            : new Date()
        )
      };
    };
    const prevState = state as ItwCredentialsState & PersistPartial;
    return {
      ...prevState,
      eid: pipe(prevState.eid, O.map(addIatExpProperties)),
      credentials: prevState.credentials.map(credential =>
        pipe(credential, O.map(addIatExpProperties))
      )
    };
  }
};
