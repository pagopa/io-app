/* eslint-disable functional/immutable-data */
import { fakerIT as faker } from "@faker-js/faker";
import { v4 } from "uuid";

import { Mandate } from "../models/Mandate";
import { ValidationCode } from "../models/ValidationCode";
import { SendConfig } from "../types/sendConfig";

const defaultMandateTimeToLiveSeconds = 120;
const defaultValidationCodeTimeToLiveSeconds = 60;

const mandates = new Array<Mandate>();
const settings = new Map<
  "mandateTimeToLiveSeconds" | "validationCodeTimeToLiveSeconds",
  number
>();

const validationCodes = new Map<string, ValidationCode>();

export interface IMandateRepository {
  createTemporaryMandate: (
    mandateId: string,
    notificationIun: string,
    taxId: string,
    timeToLive: Date
  ) => Mandate;
  createValidationCode: (
    notificationIun: string,
    qrCodeContent: string
  ) => ValidationCode;
  deleteValidationCode: (mandateId: string) => void;
  getActiveMandates: (
    notificationIUN: string,
    representativeFiscalCode: string
  ) => ReadonlyArray<Mandate>;
  getFirstValidMandate: (
    mandateId: string,
    notificationIUN: string,
    representativeFiscalCode: string
  ) => Mandate | undefined;
  getMandateList: () => ReadonlyArray<Mandate>;
  getMandateTimeToLiveSeconds: () => number;
  getValidationCode: (mandateId: string) => undefined | ValidationCode;
  getValidationCodeTimeToLiveSeconds: () => number;
  initializeIfNeeded: (
    configuration: SendConfig,
    profileFiscalCode: string
  ) => void;
}

const getMandateTimeToLiveSeconds = (): number =>
  settings.get("mandateTimeToLiveSeconds") ?? defaultMandateTimeToLiveSeconds;

const getValidationCodeTimeToLiveSeconds = (): number =>
  settings.get("validationCodeTimeToLiveSeconds") ??
  defaultValidationCodeTimeToLiveSeconds;

const createTemporaryMandate = (
  mandateId: string,
  notificationIun: string,
  taxId: string,
  timeToLive: Date
): Mandate => {
  const mandate: Mandate = {
    mandateId,
    notificationIUN: notificationIun,
    representativeFiscalCode: taxId,
    timeToLive
  };
  mandates.push(mandate);
  return mandate;
};

const createValidationCode = (
  notificationIun: string,
  qrCodeContent: string
): ValidationCode => {
  const validationCodeTimeToLiveSeconds = getValidationCodeTimeToLiveSeconds();
  const validationCodeTimeToLive = new Date();
  validationCodeTimeToLive.setTime(
    validationCodeTimeToLive.getTime() + 1000 * validationCodeTimeToLiveSeconds
  );
  const mandateTimeToLive = new Date();
  const mandateTimeToLiveSeconds = getMandateTimeToLiveSeconds();
  mandateTimeToLive.setTime(
    mandateTimeToLive.getTime() + 1000 * mandateTimeToLiveSeconds
  );
  const validationCode: ValidationCode = {
    mandateId: v4(),
    mandateTimeToLive,
    notificationIUN: notificationIun,
    qrCodeContent,
    validationCodeTimeToLive,
    validationCode: faker.number.int({ min: 0, max: 99999 }).toString()
  };
  validationCodes.set(validationCode.mandateId, validationCode);
  return validationCode;
};

const deleteValidationCode = (mandateId: string): void => {
  validationCodes.delete(mandateId);
};

const initializeIfNeeded = (
  configuration: SendConfig,
  profileFiscalCode: string
): void => {
  if (mandates.length > 0) {
    return;
  }
  settings.set(
    "mandateTimeToLiveSeconds",
    configuration.mandateTimeToLiveSeconds ?? defaultMandateTimeToLiveSeconds
  );
  settings.set(
    "validationCodeTimeToLiveSeconds",
    configuration.validationCodeTimeToLiveSeconds ??
      defaultValidationCodeTimeToLiveSeconds
  );
  configuration.sendMandates.forEach(mandateConfiguration => {
    const iun = mandateConfiguration.iun;
    const mandate: Mandate = {
      mandateId: v4(),
      notificationIUN: iun,
      representativeFiscalCode: profileFiscalCode,
      // This is a permant mandate, so it does not use the
      // 'mandateTimeToLiveSeconds', which is use for
      // temporary mandates
      timeToLive: faker.date.future({ years: 5 })
    };
    mandates.push(mandate);
  });
};

const getActiveMandates = (
  notificationIUN: string,
  representativeFiscalCode: string
): ReadonlyArray<Mandate> =>
  mandates.filter(
    mandate =>
      mandate.notificationIUN === notificationIUN &&
      mandate.representativeFiscalCode.toUpperCase() ===
        representativeFiscalCode.toUpperCase() &&
      new Date() < mandate.timeToLive
  );

const getFirstValidMandate = (
  mandateId: string,
  notificationIUN: string,
  representativeFiscalCode: string
): Mandate | undefined =>
  mandates.find(
    mandate =>
      mandate.notificationIUN === notificationIUN &&
      mandate.mandateId === mandateId &&
      mandate.representativeFiscalCode === representativeFiscalCode &&
      new Date() < mandate.timeToLive
  );

const getMandateList = (): ReadonlyArray<Mandate> =>
  mandates.map(mandate => ({ ...mandate }));

const getValidationCode = (mandateId: string): undefined | ValidationCode =>
  validationCodes.get(mandateId);

export const MandateRepository: IMandateRepository = {
  createTemporaryMandate,
  createValidationCode,
  deleteValidationCode,
  initializeIfNeeded,
  getActiveMandates,
  getFirstValidMandate,
  getMandateList,
  getMandateTimeToLiveSeconds,
  getValidationCode,
  getValidationCodeTimeToLiveSeconds
};
