import { AmountInEuroCents, RptId } from "italia-ts-commons/lib/pagopa";
import { EnteBeneficiario } from "../../definitions/backend/EnteBeneficiario";
import { Wallet } from "../../definitions/pagopa/Wallet";

export type PaymentStepQrCode = {
  kind: "PaymentStepQrCode";
};

export type PaymentStepManualEntry = {
  kind: "PaymentStepManualEntry";
};

export type PaymentStepSummary = {
  kind: "PaymentStepSummary";
  paymentRecipient: EnteBeneficiario;
  paymentReason: string;
  rptId: RptId;
  originalAmount: AmountInEuroCents;
  updatedAmount: AmountInEuroCents;
};

export type PaymentStepPickPaymentMethod = {
  kind: "PaymentStepPickPaymentMethod";
  wallets: ReadonlyArray<Wallet>;
};

export type PaymentStepConfirmPaymentMethod = {
  kind: "PaymentStepConfirmPaymentMethod";
  card: Wallet;
  amount: AmountInEuroCents;
  fee: AmountInEuroCents;
};

export type PaymentStepEnterOtp = {
  kind: "PaymentStepEnterOtp";
};

export type PaymentStepCompleted = {
  kind: "PaymentStepCompleted";
};

export type PaymentSteps =
  | PaymentStepQrCode
  | PaymentStepManualEntry
  | PaymentStepSummary
  | PaymentStepPickPaymentMethod
  | PaymentStepConfirmPaymentMethod
  | PaymentStepEnterOtp
  | PaymentStepCompleted;
