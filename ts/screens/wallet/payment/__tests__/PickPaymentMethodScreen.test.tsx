import { AmountInEuroCents, RptId } from "@pagopa/io-pagopa-commons/lib/pagopa";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import { some } from "fp-ts/lib/Option";

import { Action, Store } from "redux";
import configureMockStore from "redux-mock-store";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { WalletTypeEnum } from "../../../../../definitions/pagopa/WalletV2";

import { EnableableFunctionsEnum } from "../../../../../definitions/pagopa/EnableableFunctions";
import I18n from "../../../../i18n";
import { applicationChangeState } from "../../../../store/actions/application";
import * as NavigationActions from "../../../../store/actions/navigation";
import { pspForPaymentV2WithCallbacks } from "../../../../store/actions/wallet/payment";
import { toIndexed } from "../../../../store/helpers/indexer";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import {
  CreditCardPaymentMethod,
  SatispayPaymentMethod
} from "../../../../types/pagopa";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { convertWalletV2toWalletV1 } from "../../../../utils/walletv2";
import PickPaymentMethodScreen from "../PickPaymentMethodScreen";
import WALLET_ONBOARDING_COBADGE_ROUTES from "../../../../features/wallet/onboarding/cobadge/navigation/routes";

const rptId = {} as RptId;
const initialAmount = "300" as AmountInEuroCents;
const verifica = {} as PaymentRequestsGetResponse;
const idPayment = "123";

const aCreditCard = {
  idWallet: 1,
  kind: "CreditCard",
  walletType: WalletTypeEnum.Card,
  info: {
    brand: "VISA",
    type: undefined
  },
  enableableFunctions: [
    EnableableFunctionsEnum.pagoPA,
    EnableableFunctionsEnum.BPD
  ],
  caption: "",
  icon: "",
  pagoPA: true,
  onboardingChannel: "IO"
} as CreditCardPaymentMethod;

const aSatispay = {
  idWallet: 2,
  kind: "Satispay",
  walletType: WalletTypeEnum.Satispay,
  pagoPA: false,
  onboardingChannel: "IO",
  enableableFunctions: [EnableableFunctionsEnum.BPD],
  caption: "",
  icon: "",
  info: {}
} as SatispayPaymentMethod;

const mockPresentFn = jest.fn();

jest.mock("../../../../utils/hooks/bottomSheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");

  return {
    __esModule: true,
    useLegacyIOBottomSheetModal: () => ({
      present: mockPresentFn,
      bottomSheet: react.View
    })
  };
});
describe("PickPaymentMethodScreen", () => {
  jest.useFakeTimers();

  const mockStore = configureMockStore<GlobalState>();
  // eslint-disable-next-line functional/no-let
  let store: ReturnType<typeof mockStore>;
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("should dispatch the navigateBack action if the back button is pressed", () => {
    store = mockStore(globalState);
    const spy = jest.spyOn(NavigationActions, "navigateBack");

    const component = renderPickPaymentMethodScreen(store);

    expect(component).not.toBeNull();
    const cancelButton = component.getByText(I18n.t("global.buttons.back"));

    expect(cancelButton).not.toBeNull();
    if (cancelButton !== null) {
      fireEvent.press(cancelButton);
      expect(spy).toHaveBeenCalled();
    }
  });
  it("should dispatch the navigateToAddPaymentMethod action if the 'add payment method' button is pressed", () => {
    store = mockStore(globalState);

    const spy = jest.spyOn(
      NavigationActions,
      "navigateToWalletAddPaymentMethod"
    );

    const component = renderPickPaymentMethodScreen(store);

    const addPaymentMethodButton = component.getByText(
      I18n.t("wallet.newPaymentMethod.addButton")
    );

    expect(addPaymentMethodButton).not.toBeNull();
    if (addPaymentMethodButton !== null) {
      fireEvent.press(addPaymentMethodButton);
      expect(spy).toHaveBeenCalledWith({
        inPayment: some({
          rptId,
          initialAmount,
          verifica,
          idPayment
        })
      });
    }
  });
  it("should show the no wallet message if there aren't available payment method", () => {
    store = mockStore(globalState);

    const component = renderPickPaymentMethodScreen(store);

    expect(component).not.toBeNull();
    const noWalletMessage = component.getByTestId("noWallets");

    expect(noWalletMessage).not.toBeNull();
  });
  it("should show the availablePaymentMethodList if there is at least one available payment method", () => {
    const indexedWalletById = toIndexed(
      [aCreditCard].map(convertWalletV2toWalletV1),
      pm => pm.idWallet
    );

    store = mockStore({
      ...globalState,
      wallet: {
        ...globalState.wallet,
        wallets: {
          ...globalState.wallet.wallets,
          walletById: pot.some(indexedWalletById)
        }
      }
    });

    const component = renderPickPaymentMethodScreen(store);
    const availablePaymentMethodList = component.queryByTestId(
      "availablePaymentMethodList"
    );

    expect(availablePaymentMethodList).not.toBeNull();
  });
  it("should dispatch the navigateToConfirmOrPickPsp action if an available payment method is pressed", () => {
    const indexedWalletById = toIndexed(
      [aCreditCard].map(convertWalletV2toWalletV1),
      pm => pm.idWallet
    );

    store = mockStore({
      ...globalState,
      wallet: {
        ...globalState.wallet,
        wallets: {
          ...globalState.wallet.wallets,
          walletById: pot.some(indexedWalletById)
        }
      }
    });

    const component = renderPickPaymentMethodScreen(store);
    const availablePaymentMethodList = component.queryByTestId(
      `availableMethod-${aCreditCard.idWallet}`
    );

    expect(availablePaymentMethodList).not.toBeNull();

    if (availablePaymentMethodList !== null) {
      fireEvent.press(availablePaymentMethodList);

      expect(store.getActions()).toEqual([
        pspForPaymentV2WithCallbacks({
          idPayment,
          idWallet: aCreditCard.idWallet,
          onFailure: expect.any(Function),
          onSuccess: expect.any(Function)
        })
      ]);
    }
  });
  it("should show the notPayablePaymentMethodList there is at least one not payable payment method", () => {
    const indexedWalletById = toIndexed(
      [aSatispay].map(convertWalletV2toWalletV1),
      pm => pm.idWallet
    );

    store = mockStore({
      ...globalState,
      wallet: {
        ...globalState.wallet,
        wallets: {
          ...globalState.wallet.wallets,
          walletById: pot.some(indexedWalletById)
        }
      }
    });

    const component = renderPickPaymentMethodScreen(store);
    const availablePaymentMethodList = component.queryByTestId(
      "notPayablePaymentMethodList"
    );

    expect(availablePaymentMethodList).not.toBeNull();
  });

  it("should show a credit card if the field onboardingChannel is undefined", () => {
    const indexedWalletById = toIndexed(
      [{ ...aCreditCard, onboardingChannel: undefined }].map(
        convertWalletV2toWalletV1
      ),
      pm => pm.idWallet
    );

    store = mockStore({
      ...globalState,
      wallet: {
        ...globalState.wallet,
        wallets: {
          ...globalState.wallet.wallets,
          walletById: pot.some(indexedWalletById)
        }
      }
    });

    const component = renderPickPaymentMethodScreen(store);
    const availablePaymentMethodList = component.queryByTestId(
      "availablePaymentMethodList"
    );

    expect(availablePaymentMethodList).not.toBeNull();
  });
});

const renderPickPaymentMethodScreen = (store: Store<GlobalState, Action>) =>
  renderScreenWithNavigationStoreContext<GlobalState>(
    PickPaymentMethodScreen,
    WALLET_ONBOARDING_COBADGE_ROUTES.SEARCH_AVAILABLE,
    {
      rptId,
      initialAmount,
      verifica,
      idPayment
    },
    store
  );
