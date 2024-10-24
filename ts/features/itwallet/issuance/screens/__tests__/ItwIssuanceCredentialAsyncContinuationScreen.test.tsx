import * as O from "fp-ts/lib/Option";
import { DeepPartial } from "redux";
import { merge } from "lodash";
import configureMockStore from "redux-mock-store";
import {
  ItwIssuanceCredentialAsyncContinuationNavigationParams,
  ItwIssuanceCredentialAsyncContinuationScreen
} from "../ItwIssuanceCredentialAsyncContinuationScreen";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwLifecycleState } from "../../../lifecycle/store/reducers";

describe("ItwIssuanceCredentialAsyncContinuationScreen", () => {
  it("it should render the generic error message when route params are invalid", () => {
    const componentNoParams = renderComponent(undefined);
    expect(componentNoParams).toMatchSnapshot();

    const componentWrongParams = renderComponent({ credentialType: "invalid" });
    expect(componentWrongParams).toMatchSnapshot();
  });

  it("it should render the activate wallet screen", () => {
    const component = renderComponent(
      { credentialType: "MDL" },
      { isWalletActive: false }
    );
    expect(component).toMatchSnapshot();
  });

  it("it should render the document already present screen", () => {
    const component = renderComponent(
      { credentialType: "MDL" },
      { isWalletActive: true, hasMDL: true }
    );
    expect(component).toMatchSnapshot();
  });
});

const renderComponent = (
  routeParams?: ItwIssuanceCredentialAsyncContinuationNavigationParams,
  options?: Partial<{ isWalletActive: boolean; hasMDL: boolean }>
) => {
  const { isWalletActive = true, hasMDL = false } = options ?? {};
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(
    merge(undefined, globalState, {
      debug: {
        isDebugModeEnabled: false
      },
      backendStatus: {
        status: O.some({
          config: {
            itw: {
              enabled: true,
              min_app_version: {
                android: "0.0.0.0",
                ios: "0.0.0.0"
              }
            },
            cgn: { enabled: false },
            newPaymentSection: {
              enabled: false,
              min_app_version: {
                android: "0.0.0.0",
                ios: "0.0.0.0"
              }
            }
          }
        })
      },
      features: {
        itWallet: {
          ...(isWalletActive && {
            lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
            issuance: {
              integrityKeyTag: O.some("integrity-key")
            },
            credentials: {
              eid: O.some({}),
              credentials: hasMDL
                ? [
                    O.some({
                      credentialType: "MDL",
                      parsedCredential: {
                        expiry_date: { value: "2100-01-01" }
                      }
                    })
                  ]
                : []
            }
          })
        }
      }
    } as DeepPartial<GlobalState>)
  );

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwIssuanceCredentialAsyncContinuationScreen,
    ITW_ROUTES.ISSUANCE.CREDENTIAL_ASYNC_FLOW_CONTINUATION,
    routeParams ?? {},
    store
  );
};
