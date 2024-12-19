import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import * as configSelectors from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as itwSelectors from "../../../itwallet/common/store/selectors";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../../itwallet/common/utils/itwMocksUtils";
import { ItwJwtCredentialStatus } from "../../../itwallet/common/utils/itwTypesUtils";
import * as itwCredentialsSelectors from "../../../itwallet/credentials/store/selectors";
import * as itwLifecycleSelectors from "../../../itwallet/lifecycle/store/selectors";
import { WalletCardsState } from "../../store/reducers/cards";
import * as walletSelectors from "../../store/selectors";
import { WalletCard } from "../../types";
import {
  ItwWalletCardsContainer,
  OtherWalletCardsContainer,
  WalletCardsContainer
} from "../WalletCardsContainer";

jest.mock("react-native-reanimated", () => ({
  ...require("react-native-reanimated/mock"),
  useReducedMotion: jest.fn,
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
  },
  "5": {
    key: "5",
    category: "itw",
    type: "itw",
    credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD
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

  it("should render the loading screen", () => {
    jest
      .spyOn(walletSelectors, "selectIsWalletCardsLoading")
      .mockImplementation(() => true);
    jest
      .spyOn(walletSelectors, "selectWalletCategoryFilter")
      .mockImplementation(() => undefined);
    jest
      .spyOn(walletSelectors, "shouldRenderWalletEmptyStateSelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent(WalletCardsContainer);

    expect(queryByTestId("walletCardSkeletonTestID_1")).not.toBeNull();
    expect(queryByTestId("walletCardSkeletonTestID_2")).not.toBeNull();
    expect(queryByTestId("walletCardSkeletonTestID_3")).not.toBeNull();
    expect(queryByTestId(`itwWalletCardsContainerTestID`)).toBeNull();
    expect(queryByTestId(`otherWalletCardsContainerTestID`)).toBeNull();
    expect(queryByTestId(`walletEmptyScreenContentTestID`)).toBeNull();
    expect(queryByTestId(`walletCardsContainerTestID`)).toBeNull();
  });

  it("should render the empty screen", () => {
    jest
      .spyOn(walletSelectors, "selectIsWalletCardsLoading")
      .mockImplementation(() => false);
    jest
      .spyOn(walletSelectors, "selectWalletCategoryFilter")
      .mockImplementation(() => undefined);
    jest
      .spyOn(walletSelectors, "shouldRenderWalletEmptyStateSelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent(WalletCardsContainer);

    expect(queryByTestId("walletCardSkeletonTestID_1")).toBeNull();
    expect(queryByTestId("walletCardSkeletonTestID_2")).toBeNull();
    expect(queryByTestId("walletCardSkeletonTestID_3")).toBeNull();
    expect(queryByTestId(`itwWalletCardsContainerTestID`)).toBeNull();
    expect(queryByTestId(`otherWalletCardsContainerTestID`)).toBeNull();
    expect(queryByTestId(`walletEmptyScreenContentTestID`)).not.toBeNull();
    expect(queryByTestId(`walletCardsContainerTestID`)).toBeNull();
    expect(queryByTestId(`walletCardsContainerTestID`)).toBeNull();
  });

  it.each([
    [undefined, ["itw", "other"]],
    ["itw", ["itw"]],
    ["other", ["other"]]
  ] as const)(
    "when the category filter is %p, the %p cards should be rendered",
    (categoryFilter, expectedCategories) => {
      jest
        .spyOn(walletSelectors, "selectWalletOtherCards")
        .mockImplementation(() => [T_CARDS["1"], T_CARDS["2"], T_CARDS["3"]]);

      jest
        .spyOn(walletSelectors, "selectWalletItwCards")
        .mockImplementation(() => [T_CARDS["4"], T_CARDS["5"]]);

      jest
        .spyOn(configSelectors, "isItwEnabledSelector")
        .mockImplementation(() => true);
      jest
        .spyOn(walletSelectors, "selectIsWalletCardsLoading")
        .mockImplementation(() => false);
      jest
        .spyOn(walletSelectors, "selectWalletCategoryFilter")
        .mockImplementation(() => categoryFilter);
      jest
        .spyOn(walletSelectors, "shouldRenderWalletEmptyStateSelector")
        .mockImplementation(() => false);

      const { queryByTestId } = renderComponent(WalletCardsContainer);

      expect(queryByTestId("walletCardSkeletonTestID_1")).toBeNull();
      expect(queryByTestId("walletCardSkeletonTestID_2")).toBeNull();
      expect(queryByTestId("walletCardSkeletonTestID_3")).toBeNull();
      expect(queryByTestId(`walletEmptyScreenContentTestID`)).toBeNull();
      expect(queryByTestId(`walletCardsContainerTestID`)).not.toBeNull();

      expectedCategories.forEach(category => {
        expect(
          queryByTestId(`${category}WalletCardsContainerTestID`)
        ).not.toBeNull();
      });
    }
  );

  it.each([
    { isLoading: true, isEmpty: false },
    { isLoading: false, isEmpty: true }
  ])(
    "should render the ITW discovery banner if %p",
    ({ isLoading, isEmpty }) => {
      jest
        .spyOn(itwSelectors, "isItwDiscoveryBannerRenderableSelector")
        .mockImplementation(() => true);

      jest
        .spyOn(walletSelectors, "selectIsWalletCardsLoading")
        .mockImplementation(() => isLoading);
      jest
        .spyOn(walletSelectors, "shouldRenderWalletEmptyStateSelector")
        .mockImplementation(() => isEmpty);

      const { queryByTestId } = renderComponent(WalletCardsContainer);

      expect(
        queryByTestId("itwDiscoveryBannerStandaloneTestID")
      ).not.toBeNull();
    }
  );
});

describe("ItwWalletCardsContainer", () => {
  it("should not render if ITW is not enabled", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(configSelectors, "isItwEnabledSelector")
      .mockImplementation(() => false);

    const { queryByTestId } = renderComponent(ItwWalletCardsContainer);
    expect(queryByTestId("itwWalletReadyBannerTestID")).toBeNull();
  });

  it("should render the wallet ready banner", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(configSelectors, "isItwEnabledSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(itwSelectors, "itwShouldRenderWalletReadyBannerSelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent(ItwWalletCardsContainer);
    expect(queryByTestId("itwWalletReadyBannerTestID")).not.toBeNull();
  });

  it("should render credential cards", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(configSelectors, "isItwEnabledSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(walletSelectors, "selectWalletItwCards")
      .mockImplementation(() => [T_CARDS["4"], T_CARDS["5"]]);

    const { queryByTestId } = renderComponent(ItwWalletCardsContainer);
    expect(queryByTestId(`walletCardsCategoryItwHeaderTestID`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_itw_itw_4`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_itw_itw_5`)).not.toBeNull();
  });

  it("should render the feedback banner", () => {
    jest
      .spyOn(itwLifecycleSelectors, "itwLifecycleIsValidSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(configSelectors, "isItwEnabledSelector")
      .mockImplementation(() => true);
    jest
      .spyOn(itwSelectors, "itwShouldRenderFeedbackBannerSelector")
      .mockImplementation(() => true);

    const { queryByTestId } = renderComponent(ItwWalletCardsContainer);
    expect(queryByTestId("itwFeedbackBannerTestID")).not.toBeNull();
  });

  it.each([
    ["valid", 0],
    ["jwtExpiring", 1],
    ["jwtExpired", 1]
  ])(
    "if the eid status is %p, the eid lifecycle alert should be rendered %p times",
    (eidStatus, renderCount) => {
      jest
        .spyOn(itwCredentialsSelectors, "itwCredentialsEidSelector")
        .mockImplementation(() => O.some(ItwStoredCredentialsMocks.eid));
      jest
        .spyOn(itwCredentialsSelectors, "itwCredentialsEidStatusSelector")
        .mockImplementation(() => eidStatus as ItwJwtCredentialStatus);

      const { getAllByTestId } = renderComponent(ItwWalletCardsContainer);
      const alerts = getAllByTestId(`itwEidLifecycleAlertTestID_${eidStatus}`);
      expect(alerts).toHaveLength(renderCount + 1);
    }
  );
});

describe("OtherWalletCardsContainer", () => {
  it("should not render if there are no payments or bonuses cards", () => {
    jest
      .spyOn(walletSelectors, "selectWalletOtherCards")
      .mockImplementation(() => []);

    const { queryByTestId } = renderComponent(OtherWalletCardsContainer);
    expect(queryByTestId("otherWalletCardsContainerTestID")).toBeNull();
  });

  it("should render other cards", () => {
    jest
      .spyOn(walletSelectors, "selectWalletOtherCards")
      .mockImplementation(() => [T_CARDS["1"], T_CARDS["2"], T_CARDS["3"]]);

    const { queryByTestId } = renderComponent(OtherWalletCardsContainer);
    expect(queryByTestId(`walletCardsCategoryOtherHeaderTestID`)).toBeNull();
    expect(queryByTestId(`walletCardTestID_payment_payment_1`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_bonus_idPay_2`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_cgn_cgn_3`)).not.toBeNull();
  });

  it("should render header if there are more than one category", () => {
    jest
      .spyOn(walletSelectors, "selectWalletOtherCards")
      .mockImplementation(() => [T_CARDS["1"], T_CARDS["2"], T_CARDS["3"]]);
    jest
      .spyOn(walletSelectors, "selectWalletCategories")
      .mockImplementation(() => new Set(["itw", "other"]));

    const { queryByTestId } = renderComponent(OtherWalletCardsContainer);
    expect(
      queryByTestId(`walletCardsCategoryOtherHeaderTestID`)
    ).not.toBeNull();
  });

  it("should render the placeholders", () => {
    jest
      .spyOn(walletSelectors, "selectWalletOtherCards")
      .mockImplementation(() => Object.values(T_PLACEHOLDERS));

    const { queryByTestId } = renderComponent(OtherWalletCardsContainer);

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
    jest
      .spyOn(walletSelectors, "selectWalletOtherCards")
      .mockImplementation(() => [
        T_CARDS["1"],
        T_PLACEHOLDERS["2"],
        T_CARDS["3"],
        T_PLACEHOLDERS["4"]
      ]);

    const { queryByTestId } = renderComponent(OtherWalletCardsContainer);

    expect(queryByTestId(`walletCardTestID_payment_payment_1`)).not.toBeNull();
    expect(
      queryByTestId(`walletCardTestID_bonus_placeholder_2`)
    ).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_cgn_cgn_3`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_itw_placeholder_4`)).not.toBeNull();
  });
});

const renderComponent = (component: React.ComponentType<any>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    component,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
