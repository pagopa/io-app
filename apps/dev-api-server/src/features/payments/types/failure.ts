import { PaymentFaultV2Enum } from "@io-app/api-types/generated/definitions/communication/PaymentFaultV2";
import {
  FaultCodeCategoryEnum as GatewayEnum,
  GatewayFaultPaymentProblemJson
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { PartyConfigurationFaultEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PartyConfigurationFault";
import {
  PartyConfigurationFaultPaymentProblemJson,
  FaultCodeCategoryEnum as PartyEnum
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PartyConfigurationFaultPaymentProblemJson";
import { PaymentCanceledStatusFaultEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentCanceledStatusFault";
import {
  FaultCodeCategoryEnum as CancelledEnum,
  PaymentCanceledStatusFaultPaymentProblemJson
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentCanceledStatusFaultPaymentProblemJson";
import { PaymentDuplicatedStatusFaultEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentDuplicatedStatusFault";
import {
  FaultCodeCategoryEnum as DuplicatedEnum,
  PaymentDuplicatedStatusFaultPaymentProblemJson
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentDuplicatedStatusFaultPaymentProblemJson";
import { PaymentExpiredStatusFaultEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentExpiredStatusFault";
import {
  FaultCodeCategoryEnum as ExpiredEnum,
  PaymentExpiredStatusFaultPaymentProblemJson
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentExpiredStatusFaultPaymentProblemJson";
import { PaymentOngoingStatusFaultEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentOngoingStatusFault";
import {
  FaultCodeCategoryEnum as OngoingEnum,
  PaymentOngoingStatusFaultPaymentProblemJson
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/PaymentOngoingStatusFaultPaymentProblemJson";
import { ValidationFaultPaymentDataErrorProblemJson } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentDataErrorProblemJson";
import { ValidationFaultPaymentUnavailableEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailable";
import {
  FaultCodeCategoryEnum as ValidationEnum,
  ValidationFaultPaymentUnavailableProblemJson
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnavailableProblemJson";
import { ValidationFaultPaymentUnknownEnum } from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnknown";
import {
  FaultCodeCategoryEnum as UnknownEnum,
  ValidationFaultPaymentUnknownProblemJson
} from "@io-app/api-types/generated/definitions/pagopa/ecommerce/ValidationFaultPaymentUnknownProblemJson";
import * as t from "io-ts";

export type WalletPaymentFailure = t.TypeOf<typeof WalletPaymentFailure>;
export const WalletPaymentFailure = t.union([
  GatewayFaultPaymentProblemJson,
  PartyConfigurationFaultPaymentProblemJson,
  ValidationFaultPaymentUnknownProblemJson,
  ValidationFaultPaymentDataErrorProblemJson,
  PaymentExpiredStatusFaultPaymentProblemJson,
  PaymentOngoingStatusFaultPaymentProblemJson,
  PaymentCanceledStatusFaultPaymentProblemJson,
  ValidationFaultPaymentUnavailableProblemJson,
  PaymentDuplicatedStatusFaultPaymentProblemJson
]);

export const getStatusCodeForWalletFailure = (
  failure: WalletPaymentFailure
): 400 | 404 | 409 | 502 | 503 => {
  if (
    ValidationFaultPaymentUnknownProblemJson.is(failure) ||
    ValidationFaultPaymentDataErrorProblemJson.is(failure)
  ) {
    return 404;
  } else if (
    PaymentDuplicatedStatusFaultPaymentProblemJson.is(failure) ||
    PaymentOngoingStatusFaultPaymentProblemJson.is(failure) ||
    PaymentExpiredStatusFaultPaymentProblemJson.is(failure) ||
    PaymentCanceledStatusFaultPaymentProblemJson.is(failure)
  ) {
    return 409;
  } else if (
    GatewayFaultPaymentProblemJson.is(failure) ||
    ValidationFaultPaymentUnavailableProblemJson.is(failure)
  ) {
    return 502;
  } else if (PartyConfigurationFaultPaymentProblemJson.is(failure)) {
    return 503;
  } else {
    return 400;
  }
};

export const httpStatusCodeFromDetailV2Enum = (input: PaymentFaultV2Enum) => {
  switch (input) {
    case PaymentFaultV2Enum.PAA_PAGAMENTO_ANNULLATO:
    case PaymentFaultV2Enum.PAA_PAGAMENTO_DUPLICATO:
    case PaymentFaultV2Enum.PAA_PAGAMENTO_IN_CORSO:
    case PaymentFaultV2Enum.PAA_PAGAMENTO_SCADUTO:
    case PaymentFaultV2Enum.PPT_PAGAMENTO_DUPLICATO:
    case PaymentFaultV2Enum.PPT_PAGAMENTO_IN_CORSO:
      return 409;
    case PaymentFaultV2Enum.PAA_PAGAMENTO_SCONOSCIUTO:
      return 404;
    case PaymentFaultV2Enum.PPT_AUTENTICAZIONE:
      return 502;
    case PaymentFaultV2Enum.PPT_ERRORE_EMESSO_DA_PAA:
      return 503;
    default:
      return 400;
  }
};

export const payloadFromDetailV2Enum = (input: PaymentFaultV2Enum) => {
  switch (input) {
    case PaymentFaultV2Enum.PAA_PAGAMENTO_ANNULLATO:
      return {
        faultCodeCategory: CancelledEnum.PAYMENT_CANCELED,
        faultCodeDetail: PaymentCanceledStatusFaultEnum.PAA_PAGAMENTO_ANNULLATO
      };
    case PaymentFaultV2Enum.PAA_PAGAMENTO_DUPLICATO:
    case PaymentFaultV2Enum.PPT_PAGAMENTO_DUPLICATO:
      return {
        faultCodeCategory: DuplicatedEnum.PAYMENT_DUPLICATED,
        faultCodeDetail:
          PaymentDuplicatedStatusFaultEnum.PAA_PAGAMENTO_DUPLICATO
      };
    case PaymentFaultV2Enum.PAA_PAGAMENTO_IN_CORSO:
    case PaymentFaultV2Enum.PPT_PAGAMENTO_IN_CORSO:
      return {
        faultCodeCategory: OngoingEnum.PAYMENT_ONGOING,
        faultCodeDetail: PaymentOngoingStatusFaultEnum.PAA_PAGAMENTO_IN_CORSO
      };
    case PaymentFaultV2Enum.PAA_PAGAMENTO_SCADUTO:
      return {
        faultCodeCategory: ExpiredEnum.PAYMENT_EXPIRED,
        faultCodeDetail: PaymentExpiredStatusFaultEnum.PAA_PAGAMENTO_SCADUTO
      };
    case PaymentFaultV2Enum.PAA_PAGAMENTO_SCONOSCIUTO:
      return {
        faultCodeCategory: UnknownEnum.PAYMENT_UNKNOWN,
        faultCodeDetail:
          ValidationFaultPaymentUnknownEnum.PAA_PAGAMENTO_SCONOSCIUTO
      };
    case PaymentFaultV2Enum.PPT_AUTENTICAZIONE:
      return {
        faultCodeCategory: ValidationEnum.PAYMENT_UNAVAILABLE,
        faultCodeDetail:
          ValidationFaultPaymentUnavailableEnum.PPT_AUTENTICAZIONE
      };
    case PaymentFaultV2Enum.PPT_ERRORE_EMESSO_DA_PAA:
      return {
        faultCodeCategory: PartyEnum.DOMAIN_UNKNOWN,
        faultCodeDetail: PartyConfigurationFaultEnum.PPT_ERRORE_EMESSO_DA_PAA
      };
    default:
      return {
        detail: "GENERIC ERROR",
        instance: GatewayEnum.GENERIC_ERROR,
        status: 400,
        title: "GENERIC ERROR",
        type: GatewayEnum.GENERIC_ERROR
      };
  }
};
