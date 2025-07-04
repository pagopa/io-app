import { DeepPartial } from "redux";
import * as O from "fp-ts/lib/Option";
import { expectSaga } from "redux-saga-test-plan";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { handleWalletCredentialsRehydration } from "../handleWalletCredentialsRehydration";
import { walletAddCards } from "../../../../wallet/store/actions/cards";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

describe("ITW handleWalletCredentialsRehydration saga", () => {
  const expirationClaim = { value: "2100-09-04", name: "exp" };
  const jwtExpiration = "2100-09-04T00:00:00.000Z";
  const mockedEid: StoredCredential = {
    credential: "",
    credentialType: CredentialType.PID,
    credentialId: "dc_sd_jwt_PersonIdentificationData",
    parsedCredential: {
      expiry_date: expirationClaim
    },
    format: "dc+sd-jwt",
    keyTag: "1",
    issuerConf: {} as StoredCredential["issuerConf"],
    jwt: {
      issuedAt: "2024-09-30T07:32:49.000Z",
      expiration: jwtExpiration
    }
  };
  const mockedMdl: StoredCredential = {
    credential: "",
    credentialType: CredentialType.DRIVING_LICENSE,
    credentialId: "dc_sd_jwt_mDL",
    parsedCredential: {
      expiry_date: expirationClaim
    },
    format: "dc+sd-jwt",
    keyTag: "2",
    issuerConf: {} as StoredCredential["issuerConf"],
    jwt: {
      issuedAt: "2024-09-30T07:32:49.000Z",
      expiration: jwtExpiration
    }
  };
  const mockedDc: StoredCredential = {
    credential: "",
    credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
    credentialId: "dc_sd_jwt_EuropeanDisabilityCard",
    parsedCredential: {
      expiry_date: expirationClaim
    },
    format: "dc+sd-jwt",
    keyTag: "3",
    issuerConf: {} as StoredCredential["issuerConf"],
    jwt: {
      issuedAt: "2024-09-30T07:32:49.000Z",
      expiration: jwtExpiration
    }
  };

  it("should not rehydrate the eID when the wallet is valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: { integrityKeyTag: O.some("key-tag") },
          credentials: {
            credentials: {}
          }
        }
      }
    };

    return expectSaga(handleWalletCredentialsRehydration)
      .withState(store)
      .not.put(
        walletAddCards([
          {
            key: `ITW_${CredentialType.PID}`,
            type: "itw",
            category: "itw",
            credentialType: CredentialType.PID,
            status: "valid"
          }
        ])
      )
      .run();
  });

  it("rehydrates other credentials when the wallet is valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: { integrityKeyTag: O.some("key-tag") },
          credentials: {
            credentials: {
              [mockedEid.credentialId]: mockedEid,
              [mockedMdl.credentialId]: mockedMdl,
              [mockedDc.credentialId]: mockedDc
            }
          }
        }
      }
    };

    return expectSaga(handleWalletCredentialsRehydration)
      .withState(store)
      .put(
        walletAddCards([
          {
            key: `ITW_${CredentialType.DRIVING_LICENSE}`,
            type: "itw",
            category: "itw",
            credentialType: CredentialType.DRIVING_LICENSE,
            status: "valid"
          },
          {
            key: `ITW_${CredentialType.EUROPEAN_DISABILITY_CARD}`,
            type: "itw",
            category: "itw",
            credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
            status: "valid"
          }
        ])
      )
      .run();
  });

  it("does not rehydrate credentials when the wallet is not valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          issuance: { integrityKeyTag: O.none },
          credentials: {
            credentials: {
              [mockedMdl.credentialId]: mockedMdl
            }
          }
        }
      }
    };

    return expectSaga(handleWalletCredentialsRehydration)
      .withState(store)
      .not.put(
        walletAddCards([
          {
            key: `ITW_${CredentialType.DRIVING_LICENSE}`,
            type: "itw",
            category: "itw",
            credentialType: CredentialType.DRIVING_LICENSE,
            status: "valid"
          }
        ])
      )
      .run();
  });
});
