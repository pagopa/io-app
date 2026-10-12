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
import * as cgnSelectors from "../../../bonus/cgn/store/reducers/details";
import * as idPayWalletSelectors from "../../../idpay/wallet/store/reducers";
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
});

const mockErrorSelectors = ({
  isPaymentMethodsError = false,
  isCdcError = false
}: {
  isCdcError?: boolean;
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
    .mockImplementation(() => pot.none);
  jest
    .spyOn(idPayWalletSelectors, "idPayWalletInitiativeListSelector")
    .mockImplementation(() => pot.none);
};

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    WalletCardsCategoryRetryErrorBanner,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
