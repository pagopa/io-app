import { setMonth } from "date-fns";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../../../definitions/content/Config";
import ROUTES from "../../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { RemoteConfigState } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { ItwLifecycleState } from "../../../../lifecycle/store/reducers";
import { ItwPreferencesState } from "../../../store/reducers/preferences";
import { ItwFeedbackBanner } from "../ItwFeedbackBanner";

type RenderOptions = {
  isItwValid?: boolean;
  isWalletEmpty?: boolean;
  preferences?: ItwPreferencesState;
};

jest.mock("../../../../../config", () => ({
  itwEnabled: true
}));

describe("ItwFeedbackBanner", () => {
  it("should render the banner", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({});
    expect(queryByTestId("itwFeedbackBannerTestID")).not.toBeNull();
  });

  it("should render the banner after one month", () => {
    const {
      component: { queryByTestId }
    } = renderComponent({
      preferences: { hideFeedbackBanner: { before: setMonth(new Date(), 1) } }
    });
    expect(queryByTestId("itwFeedbackBannerTestID")).not.toBeNull();
  });

  test.each([
    { isItwTrial: false },
    { isItwEnabled: false },
    { isItwValid: true },
    { preferences: { hideFeedbackBanner: "always" } },
    { preferences: { hideFeedbackBanner: { before: setMonth(new Date(), 1) } } }
  ] as ReadonlyArray<RenderOptions>)(
    "should not render the banner if %p",
    options => {
      const {
        component: { queryByTestId }
      } = renderComponent(options);
      expect(queryByTestId("itwDiscoveryBannerTestID")).toBeNull();
    }
  );
});

const renderComponent = ({
  isItwValid = true,
  isWalletEmpty = false,
  preferences = {}
}: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      features: {
        itWallet: isItwValid
          ? {
              lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
              issuance: { integrityKeyTag: O.some("key-tag") },
              credentials: {
                eid: O.some({}),
                credentials: isWalletEmpty ? {} : { MDL: {} }
              },
              preferences
            }
          : {
              lifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED
            }
      },
      remoteConfig: O.some({
        itw: {
          enabled: true,
          min_app_version: {
            android: "0.0.0.0",
            ios: "0.0.0.0"
          }
        },
        assistanceTool: { tool: ToolEnum.none },
        cgn: { enabled: true },
        newPaymentSection: {
          enabled: false,
          min_app_version: {
            android: "0.0.0.0",
            ios: "0.0.0.0"
          }
        },
        fims: { enabled: true }
      } as Config) as RemoteConfigState
    } as GlobalState)
  );

  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      ItwFeedbackBanner,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
