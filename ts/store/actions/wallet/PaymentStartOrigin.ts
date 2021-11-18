import { Option, none, some } from "fp-ts/lib/Option";

/**
 * Describe how a payment was generated.
 */
export type PaymentStartOrigin = FromMessage | FromQRCode | FromManualInsertion;

type FromMessage = { _tag: "message"; messageId: string };
type FromQRCode = { _tag: "qrcode_scan" };
type FromManualInsertion = { _tag: "manual_insertion" };

export function isFromMessage(input: PaymentStartOrigin): input is FromMessage {
  // eslint-disable-next-line no-underscore-dangle
  return input._tag === "message";
}

export function getMessageId(input: PaymentStartOrigin): Option<string> {
  if (isFromMessage(input)) {
    return some(input.messageId);
  }
  return none;
}

export function isFromQRCode(input: PaymentStartOrigin): input is FromQRCode {
  // eslint-disable-next-line no-underscore-dangle
  return input._tag === "qrcode_scan";
}

export function isFromManualInsertion(
  input: PaymentStartOrigin
): input is FromManualInsertion {
  // eslint-disable-next-line no-underscore-dangle
  return input._tag === "manual_insertion";
}

export function fromMessage(messageId: string): FromMessage {
  // eslint-disable-next-line no-underscore-dangle
  return { _tag: "message", messageId };
}

export function fromQRCode(): FromQRCode {
  // eslint-disable-next-line no-underscore-dangle
  return { _tag: "qrcode_scan" };
}

export function fromManualInsertion(): FromManualInsertion {
  // eslint-disable-next-line no-underscore-dangle
  return { _tag: "manual_insertion" };
}
