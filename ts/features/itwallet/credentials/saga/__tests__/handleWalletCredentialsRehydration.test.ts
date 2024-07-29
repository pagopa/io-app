import { DeepPartial } from "redux";
import * as O from "fp-ts/lib/Option";
import { expectSaga } from "redux-saga-test-plan";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { handleWalletCredentialsRehydration } from "../handleWalletCredentialsRehydration";
import { walletAddCards } from "../../../../newWallet/store/actions/cards";
import { ItwLifecycleState } from "../../../lifecycle/store/reducers";

describe("ITW handleWalletCredentialsRehydration saga", () => {
  it("rehydrates the eID when the wallet is valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
          issuance: { integrityKeyTag: O.some("key-tag") },
          credentials: {
            eid: O.some({ keyTag: "1", credentialType: CredentialType.PID }),
            credentials: []
          }
        }
      }
    };

    return expectSaga(handleWalletCredentialsRehydration)
      .withState(store)
      .put(
        walletAddCards([
          {
            key: "1",
            type: "itw",
            category: "itw",
            credentialType: CredentialType.PID
          }
        ])
      )
      .run();
  });

  it("rehydrates other credentials when the wallet is valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
          issuance: { integrityKeyTag: O.some("key-tag") },
          credentials: {
            eid: O.some({ keyTag: "1", credentialType: CredentialType.PID }),
            credentials: [
              O.none,
              O.some({
                keyTag: "2",
                credentialType: CredentialType.DRIVING_LICENSE
              }),
              O.some({
                keyTag: "3",
                credentialType: CredentialType.EUROPEAN_DISABILITY_CARD
              })
            ]
          }
        }
      }
    };

    return expectSaga(handleWalletCredentialsRehydration)
      .withState(store)
      .put(
        walletAddCards([
          {
            key: "1",
            type: "itw",
            category: "itw",
            credentialType: CredentialType.PID
          },
          {
            key: "2",
            type: "itw",
            category: "itw",
            credentialType: CredentialType.DRIVING_LICENSE
          },
          {
            key: "3",
            type: "itw",
            category: "itw",
            credentialType: CredentialType.EUROPEAN_DISABILITY_CARD
          }
        ])
      )
      .run();
  });

  it("does not rehydrate credentials when the wallet is not valid", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED,
          issuance: { integrityKeyTag: O.none },
          credentials: {
            eid: O.none,
            credentials: [
              O.some({
                keyTag: "2",
                credentialType: CredentialType.DRIVING_LICENSE
              })
            ]
          }
        }
      }
    };

    return expectSaga(handleWalletCredentialsRehydration)
      .withState(store)
      .not.put(
        walletAddCards([
          {
            key: "2",
            type: "itw",
            category: "itw",
            credentialType: CredentialType.DRIVING_LICENSE
          }
        ])
      )
      .run();
  });
});
