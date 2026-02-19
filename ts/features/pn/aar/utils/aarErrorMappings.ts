import _ from "lodash";
import { ComponentType } from "react";
import { AARError } from "../../../../../definitions/pn/aar/AARError";
import {
  trackSendAarMandateCieDataError,
  trackSendAarMandateCieExpiredError,
  trackSendAarMandateCieNotRelatedToDelegatorError
} from "../analytics";
import { SendAarGenericErrorComponent } from "../components/errors/SendAARErrorComponent";
import {
  CieExpiredComponent,
  GenericCieValidationErrorComponent,
  UnrelatedCieComponent
} from "../components/errors/SendAarCieValidationErrorComponent";
import { isDevEnv } from "../../../../utils/environment";

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
type SendAarErrorCodes = keyof (typeof cieErrors & typeof deliveryErrors);

const aarProblemJsonComponentMap = {
  ..._.mapValues(cieErrors, () => GenericCieValidationErrorComponent),
  [cieErrors.CIE_EXPIRED_ERROR]: CieExpiredComponent,
  [cieErrors.CIE_NOT_RELATED_TO_DELEGATOR_ERROR]: UnrelatedCieComponent
} satisfies { [key in SendAarErrorCodes]?: ComponentType };
export const aarProblemJsonTrackingMap = {
  ..._.mapValues(cieErrors, () => trackSendAarMandateCieDataError),
  [cieErrors.CIE_EXPIRED_ERROR]: trackSendAarMandateCieExpiredError,
  [cieErrors.CIE_NOT_RELATED_TO_DELEGATOR_ERROR]:
    trackSendAarMandateCieNotRelatedToDelegatorError
} satisfies { [key in SendAarErrorCodes]?: (...args: Array<string>) => void };

export const isAarAttachmentTtlError = (
  error?: string
): error is typeof deliveryErrors.PN_DELIVERY_MANDATENOTFOUND =>
  error === deliveryErrors.PN_DELIVERY_MANDATENOTFOUND;

export const getSendAarErrorComponent = (
  errors: ReadonlyArray<AARError> | undefined
): ComponentType => {
  const maybeErrorKey = errors
    ?.map(({ code }) => code)
    .find(error => error in aarProblemJsonComponentMap);

  if (maybeErrorKey == null) {
    return SendAarGenericErrorComponent;
  }

  return _.get(
    aarProblemJsonComponentMap,
    maybeErrorKey,
    SendAarGenericErrorComponent
  );
};

export const testable = isDevEnv
  ? {
      aarProblemJsonComponentMap
    }
  : undefined;
