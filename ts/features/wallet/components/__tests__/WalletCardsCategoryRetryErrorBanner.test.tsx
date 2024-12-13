import * as pot from "@pagopa/ts-commons/lib/pot";
import configureMockStore from "redux-mock-store";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { appReducer } from "../../../../store/reducers";
import { GlobalState } from "../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as cgnSelectors from "../../../bonus/cgn/store/reducers/details";
import * as idPayWalletSelectors from "../../../idpay/wallet/store/reducers";
import * as paymentsWalletSelectors from "../../../payments/wallet/store/selectors";
import { WalletCardsCategoryRetryErrorBanner } from "../WalletCardsCategoryRetryErrorBanner";

describe("WalletCardsCategoryRetryErrorBanner", () => {
  it.each`
    isIdPayError | isPaymentMethodsError | isCgnError | shouldRender
    ${true}      | ${false}              | ${false}   | ${true}
    ${false}     | ${true}               | ${false}   | ${true}
    ${false}     | ${false}              | ${true}    | ${true}
    ${false}     | ${false}              | ${false}   | ${false}
  `(
    "should render if %p",
    ({ isIdPayError, isPaymentMethodsError, isCgnError, shouldRender }) => {
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

      const { queryAllByTestId } = renderComponent();

      const elements = queryAllByTestId(
        "walletCardsCategoryRetryErrorBannerTestID"
      );
      expect(elements).toHaveLength(shouldRender ? 1 : 0);
    }
  );
});

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
