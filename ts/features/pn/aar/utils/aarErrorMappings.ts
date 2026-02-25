import { ComponentType } from "react";
import { isTestEnv } from "../../../../utils/environment";
import {
  CieExpiredComponent,
  GenericCieValidationErrorComponent,
  UnrelatedCieComponent
} from "../components/errors/SendAarCieValidationErrorComponent";
import { SendAarGenericErrorComponent } from "../components/errors/SendAARErrorComponent";

export enum AarErrorStatesKind {
  CIE_EXPIRED,
  CIE_NOT_RELATED_TO_DELEGATOR,
  CIE_GENERIC,
  GENERIC
}
const cieErrors = {
  PN_MANDATE_BADREQUEST: "PN_MANDATE_BADREQUEST",
  PN_GENERIC_INVALIDPARAMETER: "PN_GENERIC_INVALIDPARAMETER",
  PN_MANDATE_NOTFOUND: "PN_MANDATE_NOTFOUND",
  PN_MANDATE_INVALIDVERIFICATIONCODE: "PN_MANDATE_INVALIDVERIFICATIONCODE",
  CIE_INVALID_INPUT: "CIE_INVALID_INPUT",
  CIE_INTEGRITY_ERROR: "CIE_INTEGRITY_ERROR",
  CIE_SIGNATURE_ERROR: "CIE_SIGNATURE_ERROR",
  CIE_CHECKER_SERVER_ERROR: "CIE_CHECKER_SERVER_ERROR",
  CIE_EXPIRED_ERROR: "CIE_EXPIRED_ERROR",
  CIE_NOT_RELATED_TO_DELEGATOR_ERROR: "CIE_NOT_RELATED_TO_DELEGATOR_ERROR"
} as const;
const deliveryErrors = {
  PN_DELIVERY_MANDATENOTFOUND: "PN_DELIVERY_MANDATENOTFOUND"
} as const;
export const sendAarProblemJsonErrorCodes = {
  ...cieErrors,
  ...deliveryErrors
};
export type SendAarErrorCodes = keyof typeof sendAarProblemJsonErrorCodes;

const aarProblemJsonComponentMap = {
  [AarErrorStatesKind.CIE_EXPIRED]: CieExpiredComponent,
  [AarErrorStatesKind.CIE_NOT_RELATED_TO_DELEGATOR]: UnrelatedCieComponent,
  [AarErrorStatesKind.CIE_GENERIC]: GenericCieValidationErrorComponent,
  [AarErrorStatesKind.GENERIC]: SendAarGenericErrorComponent
} satisfies { [key in AarErrorStatesKind]: ComponentType };

export const isAarAttachmentTtlError = (
  error?: string
): error is typeof deliveryErrors.PN_DELIVERY_MANDATENOTFOUND =>
  error === deliveryErrors.PN_DELIVERY_MANDATENOTFOUND;

export const getSendAarErrorComponent = (
  maybeErrorKey?: AarErrorStatesKind
): ComponentType =>
  aarProblemJsonComponentMap[maybeErrorKey ?? AarErrorStatesKind.GENERIC];

export const testable = isTestEnv
  ? {
      aarProblemJsonComponentMap
    }
  : {};
