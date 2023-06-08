import { waitFor } from "@testing-library/react-native";
import { interpret } from "xstate";
import { createIDPayPaymentMachine } from "../machine";
import {
  AuthPaymentResponseDTO,
  StatusEnum
} from "../../../../../../definitions/idpay/AuthPaymentResponseDTO";

const T_TRX_CODE = "ABCD1234";
const T_TRANSACTION_DATA_DTO: AuthPaymentResponseDTO = {
  amountCents: 100,
  id: "",
  initiativeId: "",
  rejectionReasons: [],
  status: StatusEnum.AUTHORIZED,
  trxCode: T_TRX_CODE
};

describe("IDPay Payment machine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should have the default state of AWAITING_TRX_CODE", () => {
    const machine = createIDPayPaymentMachine();
    expect(machine.initialState.value).toEqual("AWAITING_TRX_CODE");
  });

  it("should authorize payment on happy path", async () => {
    const mockPreAuthorizePayment = jest.fn(async () =>
      Promise.resolve(T_TRANSACTION_DATA_DTO)
    );
    const mockAuthorizePayment = jest.fn(async () =>
      Promise.resolve(T_TRANSACTION_DATA_DTO)
    );

    const mockExitAuthorization = jest.fn();
    const mockNavigateToAuthorizationScreen = jest.fn();
    const mockNavigateToResultScreen = jest.fn();

    const machine = createIDPayPaymentMachine().withConfig({
      services: {
        preAuthorizePayment: mockPreAuthorizePayment,
        authorizePayment: mockAuthorizePayment
      },
      actions: {
        exitAuthorization: mockExitAuthorization,
        navigateToAuthorizationScreen: mockNavigateToAuthorizationScreen,
        navigateToResultScreen: mockNavigateToResultScreen
      }
    });

    // eslint-disable-next-line functional/no-let
    let currentState = machine.initialState;

    const service = interpret(machine).onTransition(state => {
      currentState = state;
    });

    service.start();

    expect(currentState.value).toEqual("AWAITING_TRX_CODE");

    service.send({
      type: "START_AUTHORIZATION",
      trxCode: T_TRX_CODE
    });

    expect(currentState.value).toEqual("PRE_AUTHORIZING");

    await waitFor(() =>
      expect(mockPreAuthorizePayment).toHaveBeenCalledTimes(1)
    );
    await waitFor(() =>
      expect(mockNavigateToAuthorizationScreen).toHaveBeenCalledTimes(1)
    );

    expect(currentState.value).toEqual("AWAITING_USER_CONFIRMATION");

    service.send({
      type: "CONFIRM_AUTHORIZATION"
    });

    expect(currentState.value).toEqual("AUTHORIZING");

    await waitFor(() => expect(mockAuthorizePayment).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(mockNavigateToResultScreen).toHaveBeenCalledTimes(1)
    );

    expect(currentState.value).toEqual("AUTHORIZATION_SUCCESS");

    service.send({
      type: "EXIT"
    });

    await waitFor(() => expect(mockExitAuthorization).toHaveBeenCalledTimes(1));
  });
});
