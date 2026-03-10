import _ from "lodash";
import { ComponentType } from "react";
import { AARProblemJson } from "../../../../../definitions/pn/aar/AARProblemJson";
import { isTestEnv } from "../../../../utils/environment";
import {
  trackSendAarMandateCieDataError,
  trackSendAarMandateCieExpiredError,
  trackSendAarMandateCieNotRelatedToDelegatorError
} from "../analytics";
import {
  CieExpiredComponent,
  GenericCieValidationErrorComponent,
  UnrelatedCieComponent
} from "../components/errors/SendAarCieValidationErrorComponent";
import { SendAarGenericErrorComponent } from "../components/errors/SendAARErrorComponent";

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
const sendAarProblemJsonErrorCodes = {
  ...cieErrors,
  ...deliveryErrors
} as const;
type SendAarErrorCodes = keyof typeof sendAarProblemJsonErrorCodes;

// -------------- BEHAVIOUR MAPPING LOGIC --------------
const isCieErrorCode = (code?: string): code is keyof typeof cieErrors =>
  code != null && code in cieErrors;

export const getAarErrorBehaviour = (
  problemJson?: AARProblemJson
): AarErrorBehaviour => {
  if (problemJson == null) {
    return aarGenericBehaviour;
  }
  const { status, errors } = problemJson;
  const errorCode = errors?.[0]?.code.toUpperCase();
  const isCieError = isCieErrorCode(errorCode);

  if (isCieError) {
    // return either a specific or generic CIE error behaviour
    return _.get(
      specificBehavioursByStatus,
      [status, errorCode],
      cieGenericBehaviour
    );
  }

  return aarGenericBehaviour;
};

type AarErrorBehaviour = {
  track: (reason: string) => void;
  Component: ComponentType;
};

const specificBehavioursByStatus: {
  [status: number]: {
    [errorCode in SendAarErrorCodes]?: AarErrorBehaviour;
  };
} = {
  [422]: {
    [sendAarProblemJsonErrorCodes.CIE_EXPIRED_ERROR]: {
      track: trackSendAarMandateCieExpiredError,
      Component: CieExpiredComponent
    },
    [sendAarProblemJsonErrorCodes.CIE_NOT_RELATED_TO_DELEGATOR_ERROR]: {
      track: trackSendAarMandateCieNotRelatedToDelegatorError,
      Component: UnrelatedCieComponent
    }
  }
};

const cieGenericBehaviour: AarErrorBehaviour = {
  track: trackSendAarMandateCieDataError,
  Component: GenericCieValidationErrorComponent
};

const aarGenericBehaviour: AarErrorBehaviour = {
  track: () => undefined,
  Component: SendAarGenericErrorComponent
};

// ---------------- HELPER FUNCTION FOR SPECIFIC ERROR TYPES ----------------

export const isAarAttachmentTtlError = (
  error?: string
): error is typeof deliveryErrors.PN_DELIVERY_MANDATENOTFOUND =>
  error === deliveryErrors.PN_DELIVERY_MANDATENOTFOUND;

export const testable = isTestEnv
  ? {
      cieErrors,
      sendAarProblemJsonErrorCodes,
      specificBehavioursByStatus
    }
  : undefined;
