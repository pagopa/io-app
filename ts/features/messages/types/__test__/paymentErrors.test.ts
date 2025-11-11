import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import {
  isMessagePaymentGenericError,
  isMessagePaymentSpecificError,
  isMessagePaymentTimeoutError,
  MessagePaymentError,
  toGenericMessagePaymentError,
  toSpecificMessagePaymentError,
  toTimeoutMessagePaymentError
} from "../paymentErrors";

const genericError: MessagePaymentError =
  toGenericMessagePaymentError("An error occurred");
const specificError: MessagePaymentError = toSpecificMessagePaymentError(
  Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
);
const timeoutError: MessagePaymentError = toTimeoutMessagePaymentError();

describe("isMessagePaymentGenericError", () => {
  it("should return true for a generic error", () => {
    const output = isMessagePaymentGenericError(genericError);
    expect(output).toBe(true);
  });
  it("should return false for a specific error", () => {
    const output = isMessagePaymentGenericError(specificError);
    expect(output).toBe(false);
  });
  it("should return false for a timeout error", () => {
    const output = isMessagePaymentGenericError(timeoutError);
    expect(output).toBe(false);
  });
});

describe("isMessagePaymentSpecificError", () => {
  it("should return false for a generic error", () => {
    const output = isMessagePaymentSpecificError(genericError);
    expect(output).toBe(false);
  });
  it("should return true for a specific error", () => {
    const output = isMessagePaymentSpecificError(specificError);
    expect(output).toBe(true);
  });
  it("should return false for a timeout error", () => {
    const output = isMessagePaymentSpecificError(timeoutError);
    expect(output).toBe(false);
  });
});

describe("isMessagePaymentTimeoutError", () => {
  it("should return false for a generic error", () => {
    const output = isMessagePaymentTimeoutError(genericError);
    expect(output).toBe(false);
  });
  it("should return false for a specific error", () => {
    const output = isMessagePaymentTimeoutError(specificError);
    expect(output).toBe(false);
  });
  it("should return true for a timeout error", () => {
    const output = isMessagePaymentTimeoutError(timeoutError);
    expect(output).toBe(true);
  });
});
