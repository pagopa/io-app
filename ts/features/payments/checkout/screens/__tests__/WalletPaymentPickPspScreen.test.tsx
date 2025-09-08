import { act, fireEvent } from "@testing-library/react-native";
import { View } from "react-native";
import { createStore } from "redux";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { Bundle } from "../../../../../../definitions/pagopa/ecommerce/Bundle";
import { PaymentMethodStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { useIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { paymentsCalculatePaymentFeesAction } from "../../store/actions/networking";
import { WalletPaymentPickPspScreen } from "../WalletPaymentPickPspScreen";

jest.mock("../../analytics");
jest.mock("../../../../../utils/hooks/bottomSheet");

const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn()
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => mockNavigation,
  useRoute: () => ({
    params: { rptId: "1234567890" as RptId }
  })
}));

const CHEAPER_VALUE = 123;
const MIDDLE_VALUE = 456;
const EXPENSIVE_VALUE = 789;
const MOCKED_PSP_LIST: ReadonlyArray<Bundle> = [
  {
    idPsp: "1",
    abi: "01010",
    pspBusinessName: "BANCO di NAPOLI",
    taxPayerFee: CHEAPER_VALUE,
    primaryCiIncurredFee: CHEAPER_VALUE,
    idBundle: "A"
  },
  {
    idPsp: "2",
    abi: "01015",
    pspBusinessName: "Banco di Sardegna",
    taxPayerFee: MIDDLE_VALUE,
    primaryCiIncurredFee: MIDDLE_VALUE,
    idBundle: "B",
    onUs: true
  },
  {
    idPsp: "3",
    abi: "03015",
    pspBusinessName: "FINECO",
    taxPayerFee: EXPENSIVE_VALUE,
    primaryCiIncurredFee: EXPENSIVE_VALUE,
    idBundle: "C"
  }
];

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const mockModal = {
  present: jest.fn(),
  dismiss: jest.fn(),
  bottomSheet: <View testID="modal-view-test" />
};
const mockedUseIOBottomSheetModal = useIOBottomSheetModal as jest.Mock;
mockedUseIOBottomSheetModal.mockReturnValue(mockModal);

describe("WalletPaymentPickPspScreen", () => {
  const renderComponent = () => {
    const state = mockStore(globalState);
    const store = createStore(appReducer, state as any);
    return {
      ...renderScreenWithNavigationStoreContext<GlobalState>(
        WalletPaymentPickPspScreen,
        PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE,
        {},
        store
      ),
      store
    };
  };

  it("renders the main content with the list content if psp list is available", () => {
    const { getAllByText, store } = renderComponent();

    dispatchSuccesMock(store);

    expect(getAllByText("BANCO di NAPOLI")).toBeTruthy();
  });

  it("shows the featured reason if there is a psp with the onUs flag", () => {
    const { getByText, store } = renderComponent();
    dispatchSuccesMock(store);
    expect(getByText(I18n.t("wallet.payment.psp.featuredReason"))).toBeTruthy();
  });

  it("doesn't show the featured reason if there is not a psp with the onUs flag", () => {
    const { queryByText, store } = renderComponent();
    act(() => {
      store.dispatch(
        paymentsCalculatePaymentFeesAction.success({
          bundles: MOCKED_PSP_LIST.map(psp => {
            const { onUs, ...rest } = psp;
            return rest;
          }),
          asset: "MOCK",
          paymentMethodDescription: "MOCK",
          paymentMethodName: "MOCK",
          paymentMethodStatus: PaymentMethodStatusEnum.ENABLED
        })
      );
    });
    expect(queryByText(I18n.t("wallet.payment.psp.featuredReason"))).toBeNull();
  });

  it("presents bottom sheet press the sort button", () => {
    const { getByTestId, store } = renderComponent();
    dispatchSuccesMock(store);
    const sortButton = getByTestId("wallet-payment-pick-psp-sort-button");
    fireEvent.press(sortButton);
    expect(mockModal.present).toHaveBeenCalled();
  });
});

const dispatchSuccesMock = (store: any) => {
  act(() => {
    store.dispatch(
      paymentsCalculatePaymentFeesAction.success({
        bundles: MOCKED_PSP_LIST,
        asset: "MOCK",
        paymentMethodDescription: "MOCK",
        paymentMethodName: "MOCK",
        paymentMethodStatus: PaymentMethodStatusEnum.ENABLED
      })
    );
  });
};
