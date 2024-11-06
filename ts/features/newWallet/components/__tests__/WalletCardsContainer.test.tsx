import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../definitions/content/Config";
import { SubscriptionStateEnum } from "../../../../../definitions/trial_system/SubscriptionState";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { RemoteConfigState } from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { CredentialType } from "../../../itwallet/common/utils/itwMocksUtils";
import { ItwLifecycleState } from "../../../itwallet/lifecycle/store/reducers";
import { WalletCardsState } from "../../store/reducers/cards";
import { WalletPlaceholdersState } from "../../store/reducers/placeholders";
import { WalletCard } from "../../types";
import { WalletCardsContainer } from "../WalletCardsContainer";
import { itwTrialId } from "../../../../config";

type RenderOptions = {
  cards?: WalletCardsState;
  isLoading?: WalletPlaceholdersState["isLoading"];
  isItwTrial?: boolean;
  isItwEnabled?: boolean;
  isItwValid?: boolean;
  isWalletEmpty?: boolean;
};

jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  Layout: {
    duration: jest.fn()
  }
}));

jest.mock("../../../../config", () => ({
  itwEnabled: true
}));

const T_CARDS: WalletCardsState = {
  "1": {
    key: "1",
    category: "payment",
    type: "payment",
    walletId: ""
  },
  "2": {
    key: "2",
    category: "bonus",
    type: "idPay",
    amount: 1234,
    avatarSource: {
      uri: ""
    },
    expireDate: new Date(),
    initiativeId: "",
    name: "ABC"
  },
  "3": {
    key: "3",
    category: "cgn",
    type: "cgn"
  },
  "4": {
    key: "4",
    category: "itw",
    type: "itw",
    credentialType: CredentialType.DRIVING_LICENSE
  }
};

const T_PLACEHOLDERS: WalletCardsState = _.mapValues(
  T_CARDS,
  card =>
    ({
      type: "placeholder",
      category: card.category,
      key: card.key
    } as WalletCard)
);

describe("WalletCardsContainer", () => {
  jest.useFakeTimers();
  jest.runAllTimers();

  it("should render the loading screen", async () => {
    const { queryByTestId } = renderComponent({
      isLoading: true
    });

    expect(queryByTestId("walletCardSkeletonTestID")).not.toBeNull();
    expect(queryByTestId(`walletCardsCategoryTestID_itw`)).toBeNull();
    expect(queryByTestId(`walletCardsCategoryTestID_other`)).toBeNull();
  });

  it("should render the placeholders", () => {
    const { queryByTestId } = renderComponent({
      cards: T_PLACEHOLDERS,
      isLoading: true
    });

    expect(queryByTestId("walletCardSkeletonTestID")).toBeNull();

    expect(queryByTestId(`walletCardsCategoryTestID_itw`)).not.toBeNull();
    expect(queryByTestId(`walletCardsCategoryTestID_other`)).not.toBeNull();

    expect(
      queryByTestId(`walletCardTestID_payment_placeholder_1`)
    ).not.toBeNull();
    expect(
      queryByTestId(`walletCardTestID_bonus_placeholder_2`)
    ).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_cgn_placeholder_3`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_itw_placeholder_4`)).not.toBeNull();
  });

  it("should render placeholders along with available cards", () => {
    const { queryByTestId } = renderComponent({
      cards: {
        "1": T_CARDS["1"],
        "2": T_PLACEHOLDERS["2"],
        "3": T_CARDS["3"],
        "4": T_PLACEHOLDERS["4"]
      }
    });

    expect(queryByTestId("walletCardSkeletonTestID")).toBeNull();

    expect(queryByTestId(`walletCardsCategoryTestID_itw`)).not.toBeNull();
    expect(queryByTestId(`walletCardsCategoryTestID_other`)).not.toBeNull();

    expect(queryByTestId(`walletCardTestID_payment_payment_1`)).not.toBeNull();
    expect(
      queryByTestId(`walletCardTestID_bonus_placeholder_2`)
    ).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_cgn_cgn_3`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_itw_placeholder_4`)).not.toBeNull();
  });

  test.each([
    { isItwEnabled: false },
    { isItwTrial: false }
  ] as ReadonlyArray<RenderOptions>)(
    "should not render ITW section if %p",
    options => {
      const { queryByTestId } = renderComponent({
        ...options,
        cards: T_CARDS
      });

      expect(queryByTestId("walletCardSkeletonTestID")).toBeNull();
      expect(queryByTestId(`walletCardsCategoryTestID_itw`)).toBeNull();
      expect(queryByTestId(`walletCardsCategoryTestID_other`)).not.toBeNull();

      expect(
        queryByTestId(`walletCardTestID_payment_payment_1`)
      ).not.toBeNull();
      expect(queryByTestId(`walletCardTestID_bonus_idPay_2`)).not.toBeNull();
      expect(queryByTestId(`walletCardTestID_cgn_cgn_3`)).not.toBeNull();
      expect(queryByTestId(`walletCardTestID_itw_itw_4`)).toBeNull();
    }
  );

  it("should render the wallet ready banner when the wallet instance is valid and the wallet is empty", () => {
    const { queryByTestId } = renderComponent({
      isItwValid: true,
      cards: T_CARDS
    });
    expect(queryByTestId("itwWalletReadyBannerTestID")).not.toBeNull();
  });

  test.each([
    { isItwValid: false },
    { isItwValid: true, isWalletEmpty: false }
  ] as ReadonlyArray<RenderOptions>)(
    "should not render the wallet ready banner when %p",
    options => {
      const { queryByTestId } = renderComponent({
        ...options,
        cards: T_CARDS
      });
      expect(queryByTestId("itwWalletReadyBannerTestID")).toBeNull();
    }
  );
});

const renderComponent = ({
  cards = {},
  isItwEnabled = true,
  isItwTrial = true,
  isItwValid = true,
  isLoading = false,
  isWalletEmpty = true
}: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
      trialSystem: isItwTrial
        ? {
            [itwTrialId]: pot.some(SubscriptionStateEnum.ACTIVE)
          }
        : {},
      features: {
        wallet: {
          cards,
          placeholders: { isLoading }
        },
        itWallet: {
          ...(isItwValid && {
            issuance: {
              integrityKeyTag: O.some("key-tag")
            },
            credentials: {
              eid: O.some({ parsedCredential: {}, jwt: {} }),
              credentials: isWalletEmpty
                ? []
                : [O.some({ parsedCredential: {} })]
            },
            lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID
          })
        }
      },
      remoteConfig: O.some({
        itw: {
          enabled: isItwEnabled,
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

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <WalletCardsContainer />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
