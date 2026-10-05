import { InitializedProfile } from "@io-app/api-types/generated/definitions/identity/InitializedProfile";
import { AARQRCodeCheckResponse } from "@io-app/api-types/generated/definitions/pn/aar/AARQRCodeCheckResponse";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { Either, isLeft, isRight, left } from "fp-ts/lib/Either";

import { ioDevServerConfig } from "../../../config";
import { getProblemJson } from "../../../payloads/error";
import { getProfile } from "../../../persistence/profile/profile";
import { ExpressFailure } from "../../../utils/expressDTO";
import { AARRepository } from "../repositories/aarRepository";
import { MandateRepository } from "../repositories/mandateRepository";
import { NotificationRepository } from "../repositories/notificationRepository";

export const notificationOrMandateDataFromQRCode = (
  inputQRCodeContent: string,
  taxId: string
): Either<ExpressFailure, AARQRCodeCheckResponse> => {
  const aar = AARRepository.getAARByQRCodeContent(inputQRCodeContent);
  if (aar == null) {
    return left({
      httpStatusCode: 400,
      reason: getProblemJson(
        400,
        "AAR not found",
        `Unable to find AAR for input QRCode content (${inputQRCodeContent})`
      )
    });
  }
  const notificationIUN = aar.notificationIUN;
  const notification = NotificationRepository.getNotification(notificationIUN);
  if (notification == null) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Notification not found",
        `Input QRCode content has been recognized but no notification exists for its associated IUN. Check your dev-server configuration file for matching iun between AAR and Notifications (${aar.notificationIUN}) (${aar.qrCodeContent})`
      )
    });
  }
  const recipientFiscalCode = notification.recipientFiscalCode;
  if (recipientFiscalCode.toUpperCase() !== taxId.toUpperCase()) {
    const mandates = MandateRepository.getActiveMandates(
      notificationIUN,
      taxId
    );
    if (mandates.length === 0) {
      const denomination = fakeDenominationFromFiscalCode(recipientFiscalCode);
      const aarQrCodeCheckResponseEither = aarQRCodeCheckResponseFromData(
        notificationIUN,
        denomination,
        recipientFiscalCode
      );
      // Conversion failed, this is an internal server error
      if (isLeft(aarQrCodeCheckResponseEither)) {
        return aarQrCodeCheckResponseEither;
      }
      // Conversion succeeeded but the access is denied
      return left({
        httpStatusCode: 403,
        reason: aarQrCodeCheckResponseEither.right
      });
    }
    const denomination = profileFullnameOrDefault();
    const firstValidMandate = mandates[0];
    const firstValidMandateId = firstValidMandate.mandateId;
    return aarQRCodeCheckResponseFromData(
      notificationIUN,
      denomination,
      recipientFiscalCode,
      firstValidMandateId
    );
  }
  const denomination = profileFullnameOrDefault();
  return aarQRCodeCheckResponseFromData(
    notificationIUN,
    denomination,
    recipientFiscalCode
  );
};

const fakeDenominationFromFiscalCode = (fiscalCode: string) => {
  const nameInitial = fiscalCode.length > 0 ? fiscalCode[0] : "J";
  const surnameInitial = fiscalCode.length > 3 ? fiscalCode[3] : "S";
  return `${fakeNameFromCharacter(nameInitial)} ${fakeSurnameFromCharacter(
    surnameInitial
  )}`;
};

// oxlint-disable-next-line complexity -- A-Z lookup table
const fakeNameFromCharacter = (character: string) => {
  switch (character) {
    case "A":
      return "Alice";
    case "B":
      return "Beatrice";
    case "C":
      return "Clara";
    case "D":
      return "Diana";
    case "E":
      return "Ellen";
    case "F":
      return "Fiona";
    case "G":
      return "Grace";
    case "H":
      return "Helen";
    case "I":
      return "Irene";
    case "J":
      return "Jane";
    case "K":
      return "Katherine";
    case "L":
      return "Laura";
    case "M":
      return "Mary";
    case "N":
      return "Nora";
    case "O":
      return "Olivia";
    case "P":
      return "Penelope";
    case "Q":
      return "Quinn";
    case "R":
      return "Rose";
    case "S":
      return "Sophia";
    case "T":
      return "Theresa";
    case "U":
      return "Ursula";
    case "V":
      return "Victoria";
    case "W":
      return "Winifred";
    case "X":
      return "Xena";
    case "Y":
      return "Yvonne";
    case "Z":
      return "Zelda";
    default:
      return "Ellen";
  }
};

// oxlint-disable-next-line complexity -- A-Z lookup table
const fakeSurnameFromCharacter = (character: string) => {
  switch (character) {
    case "A":
      return "Anderson";
    case "B":
      return "Brown";
    case "C":
      return "Carter";
    case "D":
      return "Davis";
    case "E":
      return "Evans";
    case "F":
      return "Foster";
    case "G":
      return "Green";
    case "H":
      return "Harris";
    case "I":
      return "Irwin";
    case "J":
      return "Johnson";
    case "K":
      return "King";
    case "L":
      return "Lee";
    case "M":
      return "Miller";
    case "N":
      return "Nelson";
    case "O":
      return "Owens";
    case "P":
      return "Parker";
    case "Q":
      return "Quinn";
    case "R":
      return "Ripley";
    case "S":
      return "Scott";
    case "T":
      return "Taylor";
    case "U":
      return "Upton";
    case "V":
      return "Vaughn";
    case "W":
      return "Williams";
    case "X":
      return "Xavier";
    case "Y":
      return "Young";
    case "Z":
      return "Zimmerman";
    default:
      return "Ripley";
  }
};

const profileFullnameOrDefault = () => {
  const profileObject = getProfile().payload;
  const initializedProfile = InitializedProfile.decode(profileObject);
  if (isRight(initializedProfile)) {
    return `${initializedProfile.right.name} ${initializedProfile.right.family_name}`;
  }
  return `${ioDevServerConfig.profile.attrs.name} ${ioDevServerConfig.profile.attrs.family_name}`;
};

const aarQRCodeCheckResponseFromData = (
  iun: string,
  denomination: string,
  fiscalCode: string,
  mandateId?: string
): Either<ExpressFailure, AARQRCodeCheckResponse> => {
  const aarQRCodeCheckResponseEither = AARQRCodeCheckResponse.decode({
    iun,
    recipientInfo: {
      denomination,
      taxId: fiscalCode
    },
    mandateId
  });
  if (isLeft(aarQRCodeCheckResponseEither)) {
    return left({
      httpStatusCode: 500,
      reason: getProblemJson(
        500,
        "Conversion to AARQRCodeCheckResponse failed",
        `Unable to convert input data to the AARQRCodeCheckResponse data structure (${readableReportSimplified(
          aarQRCodeCheckResponseEither.left
        )})`
      )
    });
  }
  return aarQRCodeCheckResponseEither;
};
