import _ from "lodash";
import { ComponentType } from "react";
import { AARError } from "../../../../../definitions/pn/aar/AARError";
import { isTestEnv } from "../../../../utils/environment";
import {
  trackSendAarMandateCieExpiredError,
  trackSendAarMandateCieNotRelatedToDelegatorError
} from "../analytics";
import { SendAarGenericErrorComponent } from "../components/errors/SendAARErrorComponent";
import {
  CieExpiredComponent,
  GenericCieValidationErrorComponent,
  UnrelatedCieComponent
} from "../components/errors/SendAarCieValidationErrorComponent";

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
type SendAarErrorCodes = keyof typeof cieErrors | keyof typeof deliveryErrors;

const aarProblemJsonErrorComponentsMap = {
  ..._.mapValues(cieErrors, () => GenericCieValidationErrorComponent),
  [cieErrors.CIE_EXPIRED_ERROR]: CieExpiredComponent,
  [cieErrors.CIE_NOT_RELATED_TO_DELEGATOR_ERROR]: UnrelatedCieComponent
};
export const aarProblemJsonErrorTrackingMap = {
  [cieErrors.CIE_EXPIRED_ERROR]: trackSendAarMandateCieExpiredError,
  [cieErrors.CIE_NOT_RELATED_TO_DELEGATOR_ERROR]:
    trackSendAarMandateCieNotRelatedToDelegatorError
} satisfies {
  [K in SendAarErrorCodes]?: () => void;
};

export const isAarAttachmentTtlError = (
  error?: string
): error is typeof deliveryErrors.PN_DELIVERY_MANDATENOTFOUND =>
  error === deliveryErrors.PN_DELIVERY_MANDATENOTFOUND;

export const getSendAarErrorComponent = (
  errors: ReadonlyArray<AARError> | undefined
): ComponentType => {
  if (errors === undefined || errors.length === 0) {
    return SendAarGenericErrorComponent;
  }
  const maybeErrorKey = errors
    .map(({ code }) => code)
    .find(
      (error): error is keyof typeof aarProblemJsonErrorComponentsMap =>
        error in aarProblemJsonErrorComponentsMap
    );

  if (maybeErrorKey == null) {
    // if none found, return the generic error component
    return SendAarGenericErrorComponent;
  }

  return aarProblemJsonErrorComponentsMap[maybeErrorKey];
};

export const testable = isTestEnv
  ? { aarErrorMap: aarProblemJsonErrorComponentsMap }
  : {};
