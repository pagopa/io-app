import { SdJwt } from "@pagopa/io-react-native-wallet";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { MigrationManifest, PersistedState } from "redux-persist";
import { WALLET_SPEC_VERSION } from "../../../common/utils/constants";
import { extractVerification } from "../../../common/utils/itwCredentialUtils";

type MigrationState = PersistedState & Record<string, any>;

export const CURRENT_REDUX_ITW_CREDENTIALS_STORE_VERSION = 7;

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
  },

  // Version 3
  // Add credentialId and use it as key, with fallback to credentialType
  "3": (state: MigrationState) => ({
    ...state,
    credentials: Object.fromEntries(
      Object.values<Record<string, any>>(state.credentials).map(credential => {
        const credentialId =
          credential.credentialId ?? credential.credentialType;
        return [credentialId, { ...credential, credentialId }];
      })
    )
  }),

  // Version 4
  // Change legacy MDL's credentialType to mDL to be consistent with the new API 1.0
  // Their credentialId is left unchanged as MDL to be able to access the related
  // `credential_configurations_supported` in the legacy Entity Configuration
  "4": (state: MigrationState) => ({
    ...state,
    credentials: Object.fromEntries(
      Object.values<Record<string, any>>(state.credentials).map(credential => [
        credential.credentialId,
        {
          ...credential,
          credentialType: credential.credentialType.replace("MDL", "mDL")
        }
      ])
    )
  }),

  // Version 5
  // Invalidate all status attestations so they can be fetched again from the new API 1.0
  "5": (state: MigrationState) => ({
    ...state,
    credentials: Object.fromEntries(
      Object.values<Record<string, any>>(state.credentials).map(credential => [
        credential.credentialId,
        { ...credential, storedStatusAttestation: undefined }
      ])
    )
  }),

  // Version 6
  // Rename Status Attestation to Status Assertion
  "6": (state: MigrationState) => {
    const mapStatusAttestationToAssertion = (
      statusAttObj?: Record<string, any>
    ) =>
      statusAttObj?.credentialStatus === "valid"
        ? {
            credentialStatus: statusAttObj.credentialStatus,
            statusAssertion: statusAttObj.statusAttestation,
            parsedStatusAssertion: statusAttObj.parsedStatusAttestation
          }
        : statusAttObj;

    return {
      ...state,
      credentials: Object.fromEntries(
        Object.values<Record<string, any>>(state.credentials).map(
          ({ storedStatusAttestation, ...rest }) => [
            rest.credentialId,
            {
              ...rest,
              storedStatusAssertion: mapStatusAttestationToAssertion(
                storedStatusAttestation
              )
            }
          ]
        )
      )
    };
  },

  // Version 7
  // Add spec_version and verification fields to stored credentials
  "7": (state: MigrationState) => {
    const addSpecVersionAndVerification = (cred: Record<string, any>) => ({
      ...cred,
      spec_version: WALLET_SPEC_VERSION,
      verification: extractVerification(cred as any)
    });

    return {
      ...state,
      credentials: Object.fromEntries(
        Object.values<Record<string, any>>(state.credentials).map(c => [
          c.credentialId,
          addSpecVersionAndVerification(c)
        ])
      )
    };
  }
};
