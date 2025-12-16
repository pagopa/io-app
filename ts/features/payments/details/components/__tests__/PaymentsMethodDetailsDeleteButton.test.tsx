import { IOToast } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent, render } from "@testing-library/react-native";
import { voidType } from "io-ts";
import { Alert } from "react-native";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import I18n from "i18next";
import { Range } from "../../../../../../definitions/pagopa/ecommerce/Range";
import { PaymentMethodManagementTypeEnum } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodManagementType";
import { PaymentMethodStatusEnum } from "../../../../../../definitions/pagopa/walletv3/PaymentMethodStatus";
import { WalletInfo } from "../../../../../../definitions/pagopa/walletv3/WalletInfo";
import { WalletStatusEnum } from "../../../../../../definitions/pagopa/walletv3/WalletStatus";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { applicationChangeState } from "../../../../../store/actions/application";
import { Store } from "../../../../../store/actions/types";
import {
  useIODispatch,
  useIOSelector,
  useIOStore
} from "../../../../../store/hooks";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { selectPaymentOnboardingMethods } from "../../../onboarding/store/selectors";
import { getPaymentsWalletUserMethods } from "../../../wallet/store/actions";
import * as analytics from "../../analytics";
import { PaymentsMethodDetailsDeleteButton } from "../PaymentsMethodDetailsDeleteButton";

jest.mock("../../../../../store/hooks");
jest.mock("../../../../../mixpanelConfig/profileProperties");
jest.mock("../../analytics");
jest.mock("../../../wallet/store/actions");

const mockGoBack = jest.fn();
jest.mock("../../../../../navigation/params/AppParamsList", () => ({
  useIONavigation: () => ({
    goBack: mockGoBack
  })
}));

jest.mock("@pagopa/io-app-design-system", () => {
  const actual = jest.requireActual("@pagopa/io-app-design-system");
  return {
    ...actual,
    IOToast: {
      success: jest.fn(),
      error: jest.fn()
    }
  };
});

// Setup global store & rendering util
const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const store: ReturnType<typeof mockStore> = mockStore(globalState);

const renderComponent = (paymentMethod?: WalletInfo) => {
  const enrichedStore: Store = {
    ...store,
    getState: () => ({
      ...store.getState(),
      features: {
        ...store.getState().features,
        payments: {
          ...store.getState().features.payments,
          onboarding: {
            ...store.getState().features.payments.onboarding,
            paymentMethods: pot.some([
              {
                description: "description",
                id: "12345",
                name: "name",
                paymentTypeCode: "paymentTypeCode",
                ranges: [
                  {
                    min: 10 as Range["min"],
                    max: 10 as Range["max"]
                  }
                ],
                status: PaymentMethodStatusEnum.ENABLED,
                methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE
              }
            ])
          }
        }
      }
    })
  };

  return render(
    <Provider store={enrichedStore}>
      <PaymentsMethodDetailsDeleteButton paymentMethod={paymentMethod} />
    </Provider>
  );
};

describe("PaymentsMethodDetailsDeleteButton", () => {
  const paymentMethod: WalletInfo = {
    walletId: "wallet-1",
    creationDate: new Date(),
    applications: [],
    paymentMethodAsset: "",
    paymentMethodId: "",
    status: WalletStatusEnum.CREATED,
    clients: {},
    updateDate: new Date(),
    details: {
      type: "CREDIT_CARD",
      maskedNumber: 1234,
      instituteCode: 1,
      bankName: "Test Bank"
    }
  };

  const mockDispatch = jest.fn();
  const mockGetState = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useIODispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useIOStore as jest.Mock).mockReturnValue({ getState: mockGetState });

    (useIOSelector as jest.Mock).mockImplementation(selector => {
      if (selector === selectPaymentOnboardingMethods) {
        return pot.some([
          {
            description: "description",
            id: "12345",
            name: "name",
            paymentTypeCode: "paymentTypeCode",
            ranges: [
              {
                min: 10,
                max: 10
              }
            ],
            status: PaymentMethodStatusEnum.ENABLED,
            methodManagement: PaymentMethodManagementTypeEnum.ONBOARDABLE
          }
        ]);
      }
      return pot.none;
    });
  });

  it("does not render if paymentMethod is undefined", () => {
    const { queryByText } = renderComponent();
    expect(queryByText(I18n.t("cardComponent.removeCta"))).toBeNull();
  });

  it("renders the delete button when paymentMethod is provided", () => {
    const { getByText } = renderComponent(paymentMethod);
    expect(getByText(I18n.t("cardComponent.removeCta"))).toBeDefined();
  });

  it("shows Alert with correct text on press", () => {
    const alertSpy = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => voidType);

    const { getByText } = renderComponent(paymentMethod);
    fireEvent.press(getByText(I18n.t("cardComponent.removeCta")));

    expect(alertSpy).toHaveBeenCalledWith(
      I18n.t("wallet.newRemove.title"),
      I18n.t("wallet.newRemove.body"),
      expect.any(Array),
      { cancelable: false }
    );

    alertSpy.mockRestore();
  });

  it("dispatches delete and navigates back on alert confirm press", () => {
    jest.spyOn(Alert, "alert").mockImplementation((_, __, buttons) => {
      const destructive = buttons?.find(btn => btn.style === "destructive");
      destructive?.onPress?.();
    });

    (
      analytics.trackWalletPaymentRemoveMethodStart as jest.Mock
    ).mockImplementation(() => voidType);
    (
      analytics.trackWalletPaymentRemoveMethodConfirm as jest.Mock
    ).mockImplementation(() => voidType);
    (
      analytics.trackWalletPaymentRemoveMethodSuccess as jest.Mock
    ).mockImplementation(() => voidType);
    (
      analytics.trackWalletPaymentRemoveMethodFailure as jest.Mock
    ).mockImplementation(() => voidType);
    (updateMixpanelProfileProperties as jest.Mock).mockResolvedValue(undefined);
    (getPaymentsWalletUserMethods.request as jest.Mock).mockReturnValue({
      type: "dummy"
    });

    mockGetState.mockReturnValue({
      features: {
        payments: {
          onboarding: {
            paymentMethods: pot.some([paymentMethod, paymentMethod])
          }
        }
      }
    });

    const { getByText } = renderComponent(paymentMethod);
    fireEvent.press(getByText(I18n.t("cardComponent.removeCta")));

    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "PAYMENTS_DELETE_METHOD_REQUEST",
        payload: expect.objectContaining({
          walletId: "wallet-1",
          onSuccess: expect.any(Function),
          onFailure: expect.any(Function)
        })
      })
    );

    expect(mockGoBack).toHaveBeenCalled();

    // Test success callback
    const dispatched = mockDispatch.mock.calls[0][0];
    dispatched.payload.onSuccess();

    expect(IOToast.success).toHaveBeenCalledWith(
      I18n.t("wallet.delete.successful")
    );
    expect(
      analytics.trackWalletPaymentRemoveMethodSuccess
    ).toHaveBeenCalledWith({
      payment_method_selected: paymentMethod.details?.type,
      payment_method_status: "valid"
    });
    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(
      expect.anything(),
      { property: "SAVED_PAYMENT_METHOD", value: 0 }
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      getPaymentsWalletUserMethods.request()
    );

    dispatched.payload.onFailure();

    expect(IOToast.error).toHaveBeenCalledWith(I18n.t("wallet.delete.failed"));
    expect(
      analytics.trackWalletPaymentRemoveMethodFailure
    ).toHaveBeenCalledWith({
      payment_method_selected: paymentMethod.details?.type,
      payment_method_status: "valid"
    });
  });
});
