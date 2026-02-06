import { ComponentType } from "react";
import { AARError } from "../../../../../definitions/pn/aar/AARError";
import { SendAarGenericErrorComponent } from "../components/errors/SendAARErrorComponent";
import {
  CieExpiredComponent,
  GenericCieValidationErrorComponent,
  UnrelatedCieComponent
} from "../components/errors/SendAarCieValidationErrorComponent";
import { isTestEnv } from "../../../../utils/environment";
import {
  trackSendAarMandateCieExpiredError,
  trackSendAarMandateCieNotRelatedToDelegatorError
} from "../analytics";

const cieErrors = [
  "PN_MANDATE_BADREQUEST",
  "PN_GENERIC_INVALIDPARAMETER",
  "PN_MANDATE_NOTFOUND",
  "PN_MANDATE_INVALIDVERIFICATIONCODE",
  "CIE_INVALID_INPUT",
  "CIE_INTEGRITY_ERROR",
  "CIE_SIGNATURE_ERROR",
  "CIE_CHECKER_SERVER_ERROR",
  "CIE_EXPIRED_ERROR",
  "CIE_NOT_RELATED_TO_DELEGATOR_ERROR"
] as const;
type SendAarErrorCodes = (typeof cieErrors)[number];

const aarErrorMap: Map<SendAarErrorCodes, ComponentType> = new Map([
  ...cieErrors.map(code => [code, GenericCieValidationErrorComponent] as const),
  ["CIE_EXPIRED_ERROR", CieExpiredComponent],
  ["CIE_NOT_RELATED_TO_DELEGATOR_ERROR", UnrelatedCieComponent]
]);

export const getSendAarErrorComponent = (
  errors: ReadonlyArray<AARError> | undefined
): ComponentType => {
  if (errors === undefined || errors.length === 0) {
    return SendAarGenericErrorComponent;
  }
  const errorCodes = errors.map(e => e.code);

  // Find the first error that matches a mapped error code
  const maybeErrorKey = errorCodes.find(error =>
    aarErrorMap.has(error as SendAarErrorCodes)
  );

  // if none found, return the generic error component
  return (
    aarErrorMap.get(maybeErrorKey as SendAarErrorCodes) ??
    SendAarGenericErrorComponent
  );
};

export const aarProblemJsonErrorTrackingMap = {
  CIE_EXPIRED_ERROR: trackSendAarMandateCieExpiredError,
  CIE_NOT_RELATED_TO_DELEGATOR_ERROR:
    trackSendAarMandateCieNotRelatedToDelegatorError
} satisfies {
  [K in SendAarErrorCodes]?: () => void;
};

export const testable = isTestEnv ? { aarErrorMap } : {};
