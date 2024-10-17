import { CommonActions } from "@react-navigation/native";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ToolEnum } from "../../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../../definitions/content/Config";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { BPayPaymentMethod } from "../../../../../types/pagopa";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as hooks from "../../../onboarding/bancomat/hooks/useImageResize";
import BPayWalletPreview from "../BPayWalletPreview";
import { SubscriptionStateEnum } from "../../../../../../definitions/trial_system/SubscriptionState";
import { TrialSystemState } from "../../../../trialSystem/store/reducers";
import { itwTrialId } from "../../../../../config";
import { ItWalletState } from "../../../../itwallet/common/store/reducers";
import { ItwLifecycleState } from "../../../../itwallet/lifecycle/store/reducers";
import { PersistedFeaturesState } from "../../../../common/store/reducers";

describe("BPayWalletPreview component", () => {
  const mockStore = configureMockStore();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;

  const aBPay: BPayPaymentMethod = {
    walletType: "BPay",
    createDate: "2021-07-08",
    enableableFunctions: ["FA", "pagoPA"],
    favourite: false,
    idWallet: 25572,
    info: {
      numberObfuscated: "*******0000",
      paymentInstruments: [],
      uidHash:
        "d48a59cdfbe3da7e4fe25e28cbb47d5747720ecc6fc392c87f1636fe95db22f90004"
    },
    onboardingChannel: "IO",
    pagoPA: true,
    updateDate: "2020-11-20",
    kind: "BPay",
    caption: "BANCOMAT Pay",
    icon: 37
  } as BPayPaymentMethod;

  beforeEach(() => {
    store = mockStore({
      trialSystem: {
        [itwTrialId]: pot.some(SubscriptionStateEnum.UNSUBSCRIBED)
      } as TrialSystemState,
      remoteConfig: O.some({
        assistanceTool: { tool: ToolEnum.none },
        cgn: { enabled: true },
        newPaymentSection: {
          enabled: false,
          min_app_version: {
            android: "0.0.0.0",
            ios: "0.0.0.0"
          }
        },
        fims: { enabled: true },
        itw: {
          enabled: true,
          min_app_version: {
            android: "0.0.0.0",
            ios: "0.0.0.0"
          }
        }
      } as Config),
      features: {
        itWallet: {
          lifecycle: ItwLifecycleState.ITW_LIFECYCLE_INSTALLED
        } as ItWalletState
      } as PersistedFeaturesState
    });
  });

  it("should call navigateToBPayDetails when press on it", () => {
    jest.spyOn(hooks, "useImageResize").mockReturnValue(O.none);
    const spy = jest.spyOn(NavigationService, "dispatchNavigationAction");
    const component = getComponent(aBPay, store);
    const cardComponent = component.queryByTestId("cardPreview");
    if (cardComponent) {
      fireEvent.press(cardComponent);
      expect(spy).toHaveBeenCalledWith(
        CommonActions.navigate(ROUTES.WALLET_NAVIGATOR, {
          screen: ROUTES.WALLET_BPAY_DETAIL,
          params: { bPay: aBPay }
        })
      );
    }
  });
});

const getComponent = (bPay: BPayPaymentMethod, store: Store<unknown>) =>
  renderScreenWithNavigationStoreContext(
    () => <BPayWalletPreview bPay={bPay} />,
    "WALLET_HOME",
    {},
    store
  );
