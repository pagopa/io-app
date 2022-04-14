import * as React from "react";

import { createStore } from "redux";
import { BackendStatus } from "../../../../../definitions/content/BackendStatus";
import ROUTES from "../../../../navigation/routes";
import { applicationChangeState } from "../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../store/actions/backendStatus";
import { appReducer } from "../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { mockPrivativeCard } from "../../../../store/reducers/wallet/__mocks__/wallets";
import { PaymentMethod } from "../../../../types/pagopa";
import { renderScreenFakeNavRedux } from "../../../../utils/testWrapper";
import PaymentMethodFeatures from "../features/PaymentMethodFeatures";

const mockPresent = jest.fn();
jest.mock("@gorhom/bottom-sheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const rn = require("react-native");

  return {
    __esModule: true,
    BottomSheetModal: rn.Modal,
    BottomSheetScrollView: rn.ScrollView,
    TouchableWithoutFeedback: rn.TouchableWithoutFeedback,
    useBottomSheetModal: () => ({
      dismissAll: mockPresent
    }),
    namedExport: {
      ...require("react-native-reanimated/mock"),
      ...jest.requireActual("@gorhom/bottom-sheet")
    }
  };
});

jest.mock("../../../../config", () => ({ bpdEnabled: true }));

describe("Test for PaymentMethodCapabilities", () => {
  jest.useFakeTimers();
  it("With undefined bpd remote configuration, the BpdPaymentMethodCapability will not be rendered", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    const component = renderComponent(store.getState(), mockPrivativeCard);
    expect(component.queryByTestId("BpdPaymentMethodCapability")).toBeNull();
  });
  it("With program_active===true in remote configuration, the BpdPaymentMethodCapability will be rendered", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(backendStatusLoadSuccess(baseRawBackendStatus));

    const component = renderComponent(store.getState(), mockPrivativeCard);
    expect(
      component.queryByTestId("BpdPaymentMethodCapability")
    ).not.toBeNull();
  });
  it("With program_active===true in remote configuration and a payment method without the bpd capabilities, the BpdPaymentMethodCapability will not be rendered", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(backendStatusLoadSuccess(baseRawBackendStatus));

    const component = renderComponent(store.getState(), {
      ...mockPrivativeCard,
      enableableFunctions: ["FA", "pagoPA"]
    } as PaymentMethod);
    expect(component.queryByTestId("BpdPaymentMethodCapability")).toBeNull();
  });
  it("With program_active===false in remote configuration, the BpdPaymentMethodCapability will not be rendered", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const store = createStore(appReducer, globalState as any);
    store.dispatch(
      backendStatusLoadSuccess({
        ...baseRawBackendStatus,
        config: {
          ...baseRawBackendStatus.config,
          bpd: {
            ...baseRawBackendStatus.config.bpd,
            program_active: false
          }
        }
      } as BackendStatus)
    );

    const component = renderComponent(store.getState(), mockPrivativeCard);
    expect(component.queryByTestId("BpdPaymentMethodCapability")).toBeNull();
  });
});

const renderComponent = (state: GlobalState, paymentMethod: PaymentMethod) => {
  const store = createStore(appReducer, state as any);

  return renderScreenFakeNavRedux<GlobalState>(
    () => <PaymentMethodFeatures paymentMethod={paymentMethod} />,
    ROUTES.WALLET_BANCOMAT_DETAIL,
    {},
    store
  );
};
