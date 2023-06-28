import * as O from "fp-ts/lib/Option";
import * as React from "react";
import configureMockStore from "redux-mock-store";
import { interpret } from "xstate";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../utils/testWrapper";
import { IDPayPaymentRoutes } from "../../navigation/navigator";
import { Context, INITIAL_CONTEXT } from "../../xstate/context";
import { PaymentFailureEnum } from "../../xstate/failure";
import { createIDPayPaymentMachine } from "../../xstate/machine";
import { PaymentMachineContext } from "../../xstate/provider";
import {
  selectFailureOption,
  selectIsCancelled,
  selectIsFailure
} from "../../xstate/selectors";
import { IDPayPaymentResultScreen } from "../IDPayPaymentResultScreen";

jest.mock("../../xstate/selectors", () => {
  const originalModule = jest.requireActual("../../xstate/selectors");
  return {
    ...originalModule,
    selectFailureOption: jest.fn(),
    selectIsFailure: jest.fn(),
    selectIsCancelled: jest.fn()
  };
});

const mockedSelectFailureOption = selectFailureOption as jest.MockedFunction<
  typeof selectFailureOption
>;

const mockedSelectIsFailure = selectIsFailure as jest.MockedFunction<
  typeof selectIsFailure
>;

const mockedSelectIsCancelled = selectIsCancelled as jest.MockedFunction<
  typeof selectIsCancelled
>;

const mockedExitAuthorization = jest.fn();

describe("Test IDPayPaymentResultScreen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  it("should render the screen correctly", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();
  });

  it("should render the success screen", () => {
    const { component } = renderComponent();
    expect(component).toBeTruthy();

    component.getByTestId("paymentSuccessScreenTestID");
  });

  it("should render the failure screen", () => {
    mockedSelectFailureOption.mockImplementation(() =>
      O.some(PaymentFailureEnum.GENERIC)
    );
    mockedSelectIsFailure.mockImplementation(() => true);
    mockedSelectIsCancelled.mockImplementation(() => false);

    const { component } = renderComponent();
    expect(component).toBeTruthy();

    component.getByTestId("paymentFailureScreenTestID");
  });

  it("should render the cancelled screen", () => {
    mockedSelectFailureOption.mockImplementation(() => O.none);
    mockedSelectIsFailure.mockImplementation(() => false);
    mockedSelectIsCancelled.mockImplementation(() => true);

    const { component } = renderComponent();
    expect(component).toBeTruthy();

    component.getByTestId("paymentCancelledScreenTestID");
  });
});

const renderComponent = (context?: Partial<Context>) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  const mockMachine = createIDPayPaymentMachine()
    .withConfig({
      services: {
        preAuthorizePayment: jest.fn(),
        authorizePayment: jest.fn(),
        deletePayment: jest.fn()
      },
      actions: {
        exitAuthorization: mockedExitAuthorization,
        navigateToAuthorizationScreen: jest.fn(),
        navigateToResultScreen: jest.fn(),
        showErrorToast: jest.fn()
      }
    })
    .withContext({
      ...INITIAL_CONTEXT,
      ...context
    });

  const mockService = interpret(mockMachine);

  return {
    component: renderScreenFakeNavRedux<GlobalState>(
      () => (
        <PaymentMachineContext.Provider value={mockService}>
          <IDPayPaymentResultScreen />
        </PaymentMachineContext.Provider>
      ),
      IDPayPaymentRoutes.IDPAY_PAYMENT_RESULT,
      {},
      store
    ),
    store
  };
};
