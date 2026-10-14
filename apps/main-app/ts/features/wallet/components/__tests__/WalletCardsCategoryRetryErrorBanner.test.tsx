import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import * as appParamsList from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as cdcSelectors from "../../../bonus/cdc/wallet/store/selectors";
import { cgnDetails } from "../../../bonus/cgn/store/actions/details";
import * as cgnSelectors from "../../../bonus/cgn/store/reducers/details";
import { idPayWalletGet } from "../../../idpay/wallet/store/actions";
import * as idPayWalletSelectors from "../../../idpay/wallet/store/reducers";
import { getPaymentsWalletUserMethods } from "../../../payments/wallet/store/actions";
import * as paymentsWalletSelectors from "../../../payments/wallet/store/selectors";
import { SERVICES_ROUTES } from "../../../services/common/navigation/routes";
import { WalletCardsCategoryRetryErrorBanner } from "../WalletCardsCategoryRetryErrorBanner";

describe("WalletCardsCategoryRetryErrorBanner", () => {
  it.each`
    isIdPayError | isPaymentMethodsError | isCgnError | isCdcError | shouldRender
    ${true}      | ${false}              | ${false}   | ${false}   | ${true}
    ${false}     | ${true}               | ${false}   | ${false}   | ${true}
    ${false}     | ${false}              | ${true}    | ${false}   | ${true}
    ${false}     | ${false}              | ${false}   | ${true}    | ${true}
    ${false}     | ${false}              | ${false}   | ${false}   | ${false}
  `(
    "should render if %p",
    ({
      isIdPayError,
      isPaymentMethodsError,
      isCgnError,
      isCdcError,
      shouldRender
    }) => {
      jest
        .spyOn(idPayWalletSelectors, "idPayWalletInitiativeListSelector")
        .mockImplementation(() =>
          isIdPayError ? pot.someError({} as any, {} as any) : pot.none
        );

      jest
        .spyOn(paymentsWalletSelectors, "paymentsWalletUserMethodsSelector")
        .mockImplementation(() =>
          isPaymentMethodsError ? pot.someError({} as any, {} as any) : pot.none
        );

      jest
        .spyOn(cgnSelectors, "cgnDetailSelector")
        .mockImplementation(() =>
          isCgnError ? pot.someError({} as any, {} as any) : pot.none
        );

      jest
        .spyOn(cdcSelectors, "cdcStatusSelector")
        .mockImplementation(() =>
          isCdcError ? pot.someError({} as any, {} as any) : pot.none
        );

      const { queryAllByTestId } = renderComponent();

      const elements = queryAllByTestId(
        "walletCardsCategoryRetryErrorBannerTestID"
      );
      expect(elements).toHaveLength(shouldRender ? 1 : 0);
    }
  );

  it("should prioritize bonus errors and navigate to services", () => {
    mockErrorSelectors({
      isPaymentMethodsError: true,
      isCdcError: true
    });
    const navigate = jest.fn();
    jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
      navigate
    } as unknown as ReturnType<typeof appParamsList.useIONavigation>);

    const { getByTestId, getByText, queryByText } = renderComponent();

    expect(
      getByText(
        I18n.t("features.wallet.home.otherMethods.error.banner.bonus.label")
      )
    ).toBeTruthy();
    expect(
      queryByText(
        I18n.t(
          "features.wallet.home.otherMethods.error.banner.paymentMethods.label"
        )
      )
    ).toBeNull();

    fireEvent.press(
      getByTestId("walletCardsCategoryRetryErrorBannerActionTestID")
    );

    expect(navigate).toHaveBeenCalledWith(SERVICES_ROUTES.SERVICES_HOME);
  });

  it("should navigate to services for a CdC status error", () => {
    mockErrorSelectors({ isCdcError: true });
    const navigate = jest.fn();
    jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
      navigate
    } as unknown as ReturnType<typeof appParamsList.useIONavigation>);

    const { getByTestId } = renderComponent();

    fireEvent.press(
      getByTestId("walletCardsCategoryRetryErrorBannerActionTestID")
    );

    expect(navigate).toHaveBeenCalledWith(SERVICES_ROUTES.SERVICES_HOME);
  });

  it.each([
    ["CGN", { isCgnError: true }, cgnDetails.request().type],
    ["IDPay", { isIdPayError: true }, idPayWalletGet.request().type]
  ])(
    "should keep the %s retry behavior for standalone errors",
    (_, errors, actionType) => {
      mockErrorSelectors(errors);
      const navigate = jest.fn();
      jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
        navigate
      } as unknown as ReturnType<typeof appParamsList.useIONavigation>);

      const { getByTestId, store } = renderComponent();

      fireEvent.press(
        getByTestId("walletCardsCategoryRetryErrorBannerActionTestID")
      );

      expect(navigate).not.toHaveBeenCalled();
      expect(store.getActions()).toEqual(
        expect.arrayContaining([expect.objectContaining({ type: actionType })])
      );
    }
  );

  it.each([
    [
      "CGN",
      { isPaymentMethodsError: true, isCgnError: true },
      [getPaymentsWalletUserMethods.request().type, cgnDetails.request().type]
    ],
    [
      "IDPay",
      { isPaymentMethodsError: true, isIdPayError: true },
      [
        getPaymentsWalletUserMethods.request().type,
        idPayWalletGet.request().type
      ]
    ]
  ])(
    "should retry payment methods and %s when both fail",
    (_, errors, expectedActionTypes: ReadonlyArray<string>) => {
      mockErrorSelectors(errors);
      const navigate = jest.fn();
      jest.spyOn(appParamsList, "useIONavigation").mockReturnValue({
        navigate
      } as unknown as ReturnType<typeof appParamsList.useIONavigation>);

      const { getByTestId, store } = renderComponent();

      fireEvent.press(
        getByTestId("walletCardsCategoryRetryErrorBannerActionTestID")
      );

      const dispatchedActionTypes = store
        .getActions()
        .map(action => action.type);
      expect(navigate).not.toHaveBeenCalled();
      expect(dispatchedActionTypes).toEqual(
        expect.arrayContaining(expectedActionTypes)
      );
    }
  );
});

const mockErrorSelectors = ({
  isPaymentMethodsError = false,
  isCdcError = false,
  isCgnError = false,
  isIdPayError = false
}: {
  isCdcError?: boolean;
  isCgnError?: boolean;
  isIdPayError?: boolean;
  isPaymentMethodsError?: boolean;
}) => {
  jest
    .spyOn(paymentsWalletSelectors, "paymentsWalletUserMethodsSelector")
    .mockImplementation(() =>
      isPaymentMethodsError ? pot.someError({} as any, {} as any) : pot.none
    );
  jest
    .spyOn(cdcSelectors, "cdcStatusSelector")
    .mockImplementation(() =>
      isCdcError ? pot.someError({} as any, {} as any) : pot.none
    );
  jest
    .spyOn(cgnSelectors, "cgnDetailSelector")
    .mockImplementation(() =>
      isCgnError ? pot.someError({} as any, {} as any) : pot.none
    );
  jest
    .spyOn(idPayWalletSelectors, "idPayWalletInitiativeListSelector")
    .mockImplementation(() =>
      isIdPayError ? pot.someError({} as any, {} as any) : pot.none
    );
};

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    ...renderScreenWithNavigationStoreContext<GlobalState>(
      WalletCardsCategoryRetryErrorBanner,
      ROUTES.WALLET_HOME,
      {},
      store
    ),
    store
  };
};
