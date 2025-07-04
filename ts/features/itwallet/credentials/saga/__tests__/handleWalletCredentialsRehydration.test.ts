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
    parsedCredential: {
      expiry_date: expirationClaim
    },
    format: "vc+sd-jwt",
    keyTag: "1",
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
              [CredentialType.PID]: mockedEid,
              [CredentialType.DRIVING_LICENSE]: {
                keyTag: "2",
                credentialType: CredentialType.DRIVING_LICENSE,
                jwt: { expiration: jwtExpiration },
                parsedCredential: {
                  expiry_date: expirationClaim
                }
              },
              [CredentialType.EUROPEAN_DISABILITY_CARD]: {
                keyTag: "3",
                credentialType: CredentialType.EUROPEAN_DISABILITY_CARD,
                jwt: { expiration: jwtExpiration },
                parsedCredential: {
                  expiry_date: expirationClaim
                }
              }
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
              [CredentialType.DRIVING_LICENSE]: {
                keyTag: "2",
                credentialType: CredentialType.DRIVING_LICENSE,
                jwt: { expiration: jwtExpiration },
                parsedCredential: {
                  expiry_date: expirationClaim
                }
              }
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
