import { createStore } from "redux";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ItwStoredCredentialsMocks } from "../../../../common/utils/itwMocksUtils";
import { ItwEidIssuanceMachineContext } from "../../../../machine/eid/provider";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwPresentationPidDetailScreen } from "../ItwPresentationPidDetailScreen";

describe("ItwPresentationPidDetailScreen", () => {
  beforeEach(() => {
    jest
      .spyOn(ItwEidIssuanceMachineContext, "useActorRef")
      .mockReturnValue({ send: jest.fn() } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders the IT-Wallet ID discovery banner when it has not been dismissed", () => {
    const { queryByTestId } = renderComponent(false);

    expect(queryByTestId("itwDiscoveryInfoBannerTestID")).not.toBeNull();
  });

  it("does not render the valid lifecycle alert", () => {
    const { queryByTestId } = renderComponent(false);

    expect(queryByTestId("itwEidLifecycleAlertTestID_valid")).toBeNull();
  });

  it("does not render the IT-Wallet ID discovery banner when it has been dismissed", () => {
    const { queryByTestId } = renderComponent(true);

    expect(queryByTestId("itwDiscoveryInfoBannerTestID")).toBeNull();
  });
});

const renderComponent = (isBannerHidden: boolean) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const validEid = {
    ...ItwStoredCredentialsMocks.eid,
    credentialType: "pid",
    jwt: {
      ...ItwStoredCredentialsMocks.eid.jwt,
      issuedAt: "2026-04-27T00:00:00.000Z",
      expiration: "2126-04-27T00:00:00.000Z"
    }
  };
  const state: GlobalState = {
    ...globalState,
    features: {
      ...globalState.features,
      itWallet: {
        ...globalState.features.itWallet,
        banners: isBannerHidden
          ? {
              itw_pid_info: {
                dismissedOn: new Date().toISOString(),
                dismissCount: 1
              }
            }
          : {},
        credentials: {
          ...globalState.features.itWallet.credentials,
          credentials: {
            [validEid.credentialId]: validEid
          }
        }
      }
    }
  };

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwPresentationPidDetailScreen,
    ITW_ROUTES.PRESENTATION.PID_DETAIL,
    {},
    createStore(appReducer, state as any)
  );
};
