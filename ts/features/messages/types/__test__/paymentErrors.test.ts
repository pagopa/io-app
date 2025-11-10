import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import {
  isMessageGenericError,
  isMessageSpecificError,
  isMessageTimeoutError,
  MessagePaymentError,
  toGenericError,
  toSpecificError,
  toTimeoutError
} from "../paymentErrors";

const genericError: MessagePaymentError = toGenericError("An error occurred");
const specificError: MessagePaymentError = toSpecificError(
  Detail_v2Enum.PAA_PAGAMENTO_DUPLICATO
);
const timeoutError: MessagePaymentError = toTimeoutError();

describe("isMessageGenericError", () => {
  it("should return true for a generic error", () => {
    const output = isMessageGenericError(genericError);
    expect(output).toBe(true);
  });
  it("should return false for a specific error", () => {
    const output = isMessageGenericError(specificError);
    expect(output).toBe(false);
  });
  it("should return false for a timeout error", () => {
    const output = isMessageGenericError(timeoutError);
    expect(output).toBe(false);
  });
});

describe("isMessageSpecificError", () => {
  it("should return false for a generic error", () => {
    const output = isMessageSpecificError(genericError);
    expect(output).toBe(false);
  });
  it("should return true for a specific error", () => {
    const output = isMessageSpecificError(specificError);
    expect(output).toBe(true);
  });
  it("should return false for a timeout error", () => {
    const output = isMessageSpecificError(timeoutError);
    expect(output).toBe(false);
  });
});

describe("isMessageTimeoutError", () => {
  it("should return false for a generic error", () => {
    const output = isMessageTimeoutError(genericError);
    expect(output).toBe(false);
  });
  it("should return false for a specific error", () => {
    const output = isMessageTimeoutError(specificError);
    expect(output).toBe(false);
  });
  it("should return true for a timeout error", () => {
    const output = isMessageTimeoutError(timeoutError);
    expect(output).toBe(true);
  });
});
