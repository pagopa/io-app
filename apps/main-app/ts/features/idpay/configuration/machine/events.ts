import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../definitions/idpay/IbanPutDTO";
import { ConfigurationMode } from "../types";

type StartConfiguration = {
  readonly type: "start-configuration";
  readonly initiativeId: string;
  readonly mode: ConfigurationMode;
};

type ConfirmIbanOnboarding = {
  readonly type: "confirm-iban-onboarding";
  readonly ibanBody: IbanPutDTO;
};

type NewIbanOnboarding = {
  readonly type: "new-iban-onboarding";
};

type EnrollIban = {
  readonly type: "enroll-iban";
  readonly iban: IbanDTO;
};

type EnrollInstrument = {
  readonly type: "enroll-instrument";
  readonly walletId: string;
};

type DeleteInstrument = {
  readonly type: "delete-instrument";
  readonly instrumentId: string;
  readonly walletId: string;
};

type UpdateInstrumentSuccess = {
  readonly type: "update-instrument-success";
  readonly walletId: string;
  readonly enrolling: boolean;
};

type UpdateInstrumentFailure = {
  readonly type: "update-instrument-failure";
  readonly walletId: string;
};

type SkipInstruments = {
  readonly type: "skip-instruments";
};

type Next = {
  readonly type: "next";
};

type Back = {
  readonly type: "back";
};

type Close = {
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
