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

describe("toGenericMessagePaymentError", () => {
  it("should build a generic error with expected parameters", () => {
    const anError = toGenericMessagePaymentError("An error occurred");
    expect(anError).toEqual({
      type: "generic",
      message: "An error occurred"
    });
  });
});

describe("toSpecificMessagePaymentError", () => {
  it("should build a specific error with expected parameters", () => {
    const anError = toSpecificMessagePaymentError(
      Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
    );
    expect(anError).toEqual({
      type: "specific",
      details: Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
    });
  });
});

describe("toTimeoutMessagePaymentError", () => {
  it("should build a timeout error with expected parameters", () => {
    const anError = toTimeoutMessagePaymentError();
    expect(anError).toEqual({
      type: "timeout"
    });
  });
});
