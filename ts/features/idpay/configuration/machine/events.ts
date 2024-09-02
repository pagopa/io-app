import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../definitions/idpay/IbanPutDTO";
import { ConfigurationMode } from "../types";

export type StartConfiguration = {
  readonly type: "start-configuration";
  readonly initiativeId: string;
  readonly mode: ConfigurationMode;
};

export type ConfirmIbanOnboarding = {
  readonly type: "confirm-iban-onboarding";
  readonly ibanBody: IbanPutDTO;
};

export type NewIbanOnboarding = {
  readonly type: "new-iban-onboarding";
};

export type EnrollIban = {
  readonly type: "enroll-iban";
  readonly iban: IbanDTO;
};

export type EnrollInstrument = {
  readonly type: "enroll-instrument";
  readonly walletId: string;
};

export type DeleteInstrument = {
  readonly type: "delete-instrument";
  readonly instrumentId: string;
  readonly walletId: string;
};

export type UpdateInstrumentSuccess = {
  readonly type: "update-instrument-success";
  readonly walletId: string;
  readonly enrolling: boolean;
};

export type UpdateInstrumentFailure = {
  readonly type: "update-instrument-failure";
  readonly walletId: string;
};

export type SkipInstruments = {
  readonly type: "skip-instruments";
};

export type Next = {
  readonly type: "next";
};

export type Back = {
  readonly type: "back";
};

export type Close = {
  readonly type: "close";
};

export type IdPayConfigurationEvents =
  | StartConfiguration
  | NewIbanOnboarding
  | ConfirmIbanOnboarding
  | EnrollIban
  | EnrollInstrument
  | DeleteInstrument
  | UpdateInstrumentSuccess
  | UpdateInstrumentFailure
  | SkipInstruments
  | Next
  | Back
  | Close;
