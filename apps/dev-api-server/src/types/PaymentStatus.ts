import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import { PaymentInfoResponse } from "@io-app/api-types/generated/definitions/communication/PaymentInfoResponse";

export declare type PaymentStatus = ProcessablePayment | ProcessedPayment;

export interface ProcessablePayment {
  readonly data: PaymentInfoResponse;
  readonly type: "processable";
}

export interface ProcessedPayment {
  readonly status: { detail_v2: PaymentFaultV2Enum };
  readonly type: "processed";
}

export const isProcessedPayment = (
  paymentStatus: PaymentStatus
): paymentStatus is ProcessedPayment => paymentStatus.type === "processed";

export const processablePayment = (
  data: PaymentInfoResponse
): ProcessablePayment => ({
  type: "processable",
  data
});
export const processedPayment = (status: {
  detail_v2: PaymentFaultV2Enum;
}): ProcessedPayment => ({
  type: "processed",
  status
});

const foldW =
  <A, B>(
    onProcessed: (processedPayment: ProcessedPayment) => A,
    onProcessable: (processablePayment: ProcessablePayment) => B
  ) =>
  (paymentStatus: PaymentStatus): A | B =>
    isProcessedPayment(paymentStatus)
      ? onProcessed(paymentStatus)
      : onProcessable(paymentStatus);
export const fold: <A>(
  onProcessed: (processedPayment: ProcessedPayment) => A,
  onProcessable: (processablePayment: ProcessablePayment) => A
) => (paymentStatus: PaymentStatus) => A = foldW;
