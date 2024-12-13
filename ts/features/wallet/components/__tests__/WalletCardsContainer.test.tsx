import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { Alert } from "react-native";
import { ToolEnum } from "../../../../../definitions/content/AssistanceToolConfig";
import { Config } from "../../../../../definitions/content/Config";
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
import I18n from "../../../../i18n";
import { WalletInstanceRevocationReason } from "../../../itwallet/common/utils/itwTypesUtils";

type RenderOptions = {
  cards?: WalletCardsState;
  isLoading?: WalletPlaceholdersState["isLoading"];
  isItwEnabled?: boolean;
  isItwValid?: boolean;
  isWalletEmpty?: boolean;
  isRevoked?: boolean;
  revocationReason?: WalletInstanceRevocationReason;
};

jest.spyOn(Alert, "alert");
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

const T_PLACEHOLDERS: WalletCardsState = _.omit(
  _.mapValues(
    T_CARDS,
    card =>
      ({
        type: "placeholder",
        category: card.category,
        key: card.key
      } as WalletCard)
  ),
  "deletedCard"
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

  it("should not render ITW section if ITW is disabled", () => {
    const { queryByTestId } = renderComponent({
      isItwEnabled: false,
      cards: T_CARDS
    });

    expect(queryByTestId("walletCardSkeletonTestID")).toBeNull();
    expect(queryByTestId(`walletCardsCategoryTestID_itw`)).toBeNull();
    expect(queryByTestId(`walletCardsCategoryTestID_other`)).not.toBeNull();

    expect(queryByTestId(`walletCardTestID_payment_payment_1`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_bonus_idPay_2`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_cgn_cgn_3`)).not.toBeNull();
    expect(queryByTestId(`walletCardTestID_itw_itw_4`)).toBeNull();
  });

  it("should render the wallet ready banner when the wallet instance is valid and the wallet is empty", () => {
    const { queryByTestId } = renderComponent({
      isItwValid: true,
      cards: T_CARDS
    });
    expect(queryByTestId("itwWalletReadyBannerTestID")).not.toBeNull();
  });

  it("should not show alert if not revoked", () => {
    renderComponent({
      isRevoked: false
    });

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it("should show alert for NEW_WALLET_INSTANCE_CREATED", () => {
    renderComponent({
      isRevoked: true,
      revocationReason: "NEW_WALLET_INSTANCE_CREATED"
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t(
        "features.itWallet.walletInstanceRevoked.alert.newWalletInstanceCreated.title"
      ),
      I18n.t(
        "features.itWallet.walletInstanceRevoked.alert.newWalletInstanceCreated.content"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.walletInstanceRevoked.alert.closeButton"
          )
        },
        {
          text: I18n.t("features.itWallet.walletInstanceRevoked.alert.cta"),
          onPress: expect.any(Function)
        }
      ]
    );
  });

  it("should show alert for CERTIFICATE_REVOKED_BY_ISSUER", () => {
    renderComponent({
      isRevoked: true,
      revocationReason: "CERTIFICATE_REVOKED_BY_ISSUER"
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t(
        "features.itWallet.walletInstanceRevoked.alert.revokedByWalletProvider.title"
      ),
      I18n.t(
        "features.itWallet.walletInstanceRevoked.alert.revokedByWalletProvider.content"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.walletInstanceRevoked.alert.closeButton"
          )
        },
        {
          text: I18n.t("features.itWallet.walletInstanceRevoked.alert.cta"),
          onPress: expect.any(Function)
        }
      ]
    );
  });

  it("should show alert for REVOKED_BY_USER", () => {
    renderComponent({
      isRevoked: true,
      revocationReason: "REVOKED_BY_USER"
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t(
        "features.itWallet.walletInstanceRevoked.alert.revokedByUser.title"
      ),
      I18n.t(
        "features.itWallet.walletInstanceRevoked.alert.revokedByUser.content"
      ),
      [
        {
          text: I18n.t(
            "features.itWallet.walletInstanceRevoked.alert.closeButtonAlt"
          )
        }
      ]
    );
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
  isItwValid = true,
  isLoading = false,
  isWalletEmpty = true,
  isRevoked = false,
  revocationReason = undefined
}: RenderOptions) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(
    _.merge(undefined, globalState, {
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
            lifecycle: ItwLifecycleState.ITW_LIFECYCLE_VALID,
            walletInstance: {
              isRevoked,
              revocationReason
            }
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
