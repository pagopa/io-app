import { CIEValidationData } from "@io-app/api-types/generated/definitions/pn/aar/CIEValidationData";
import { MandateCreationResponse } from "@io-app/api-types/generated/definitions/pn/aar/MandateCreationResponse";
import { RequestCheckQrMandateDto } from "@io-app/api-types/generated/definitions/pn/aar/RequestCheckQrMandateDto";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { Either, isLeft, left, right } from "fp-ts/lib/Either";

import { getProblemJson } from "../../../payloads/error";
import { ExpressFailure } from "../../../utils/expressDTO";
import { Mandate } from "../models/Mandate";
import { ValidationCode } from "../models/ValidationCode";
import { AARRepository } from "../repositories/aarRepository";
import { MandateRepository } from "../repositories/mandateRepository";
import { NotificationRepository } from "../repositories/notificationRepository";

export const checkAndVerifyExistingMandate = (
  iun: string,
  mandateId: string | undefined,
  taxId: string
): Either<ExpressFailure, Mandate> => {
  if (mandateId == null) {
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "User mismatch",
        `The specified notification does not belong to the user that is requesting it (${iun}) (${taxId})`
      )
    });
  }

  const mandate = MandateRepository.getFirstValidMandate(mandateId, iun, taxId);
  if (mandate == null) {
    return left({
      httpStatusCode: 403,
      reason: getProblemJson(
        403,
        "No valid mandate",
        `There is no valid mandate to access requested data belonging to notification (${mandateId}) (${iun}) (${taxId})`
      )
    });
  }

  return right(mandate);
};

export const checkAndCreateTemporaryMandate = (
  body: object,
  mandateId: string,
  taxId: string
): Either<ExpressFailure, Mandate> => {
  const cieValidationDataBodyEither = CIEValidationData.decode(body);
  if (isLeft(cieValidationDataBodyEither)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad body",
        `Unable to decode request body: it's either missing or has a bad data structure (${readableReportSimplified(
          cieValidationDataBodyEither.left
        )})`
      )
    });
  }

  // No CIE checks are done here

  const validationCode = MandateRepository.getValidationCode(mandateId);
  if (validationCode == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Validation Code not found",
        `Unable to find a Validation Code associated with the provided 'mandateId' (${mandateId})`
      )
    });
  }

  if (validationCode.validationCodeTimeToLive <= new Date()) {
    MandateRepository.deleteValidationCode(mandateId);
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Validation Code expired",
        `Provided signed verification code has expired (${cieValidationDataBodyEither.right.signedNonce})`
      )
    });
  }

  MandateRepository.deleteValidationCode(mandateId);
  const temporaryMandate = MandateRepository.createTemporaryMandate(
    mandateId,
    validationCode.notificationIUN,
    taxId,
    validationCode.mandateTimeToLive
  );
  return right(temporaryMandate);
};

export const checkAndCreateValidationCode = (
  body: object,
  taxId: string
): Either<ExpressFailure, ValidationCode> => {
  const createMandateBodyEither = RequestCheckQrMandateDto.decode(body);
  if (isLeft(createMandateBodyEither)) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad body",
        `Unable to decode request body: it's either missing or has a bad data structure (${readableReportSimplified(
          createMandateBodyEither.left
        )})`
      )
    });
  }
  const qrCodeContent = createMandateBodyEither.right.aarQrCodeValue;
  const aar = AARRepository.getAAR(qrCodeContent);
  if (aar == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "Bad 'iun' and/or 'qrcode'",
        `Unable to find an AAR associated with provided 'qrcode' (${qrCodeContent})`
      )
    });
  }

  const notificationIun = aar.notificationIUN;
  const notification = NotificationRepository.getNotification(notificationIun);
  if (notification == null) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Notification not found",
        `Unable to find a Notification associated to the AAR. Check you config file for any IUN mismatch between 'sendAARs' and 'sendNotifications' (${notificationIun}) (${qrCodeContent})`
      )
    });
  }
  if (notification.recipientFiscalCode === taxId) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "No mandate needed",
        `Requested Notification already belong to this user. There is no need to create a mandate (${notificationIun}) (${taxId})`
      )
    });
  }

  const activeMandates = MandateRepository.getActiveMandates(
    notificationIun,
    taxId
  );
  if (activeMandates.length > 0) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Existing mandate",
        `There is already an existing Mandate for the requested notification and user (${notificationIun}) (${taxId})`
      )
    });
  }

  const validationCode = MandateRepository.createValidationCode(
    notificationIun,
    qrCodeContent
  );
  return right(validationCode);
};

export const validationCodeToMandateCreationResponse = (
  validationCode: ValidationCode
): Either<ExpressFailure, MandateCreationResponse> => {
  const mandateCreationResponseEither = MandateCreationResponse.decode({
    requestTTL: MandateRepository.getValidationCodeTimeToLiveSeconds(),
    mandate: {
      mandateId: validationCode.mandateId,
      verificationCode: validationCode.validationCode,
      dateTo: validationCode.mandateTimeToLive.toISOString()
    }
  });
  if (isLeft(mandateCreationResponseEither)) {
    const expressFailure: ExpressFailure = {
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Failed conversion to MandateCreationResponse",
        `Conversion of input ValidationCode to output MandateCreationResponse failed (${readableReportSimplified(
          mandateCreationResponseEither.left
        )})`
      )
    };
    return left(expressFailure);
  }
  return right(mandateCreationResponseEither.right);
};
