import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../definitions/idpay/IbanPutDTO";
import { ConfigurationMode } from "../types";

export type IdPayConfigurationEvents =
  | Back
  | Close
  | ConfirmIbanOnboarding
  | DeleteInstrument
  | EnrollIban
  | EnrollInstrument
  | NewIbanOnboarding
  | Next
  | SkipInstruments
  | StartConfiguration
  | UpdateInstrumentFailure
  | UpdateInstrumentSuccess;

type Back = {
  readonly type: "back";
};

type Close = {
  readonly type: "close";
};

type ConfirmIbanOnboarding = {
  readonly ibanBody: IbanPutDTO;
  readonly type: "confirm-iban-onboarding";
};

type DeleteInstrument = {
  readonly instrumentId: string;
  readonly type: "delete-instrument";
  readonly walletId: string;
};

type EnrollIban = {
  readonly iban: IbanDTO;
  readonly type: "enroll-iban";
};

type EnrollInstrument = {
  readonly type: "enroll-instrument";
  readonly walletId: string;
};

type NewIbanOnboarding = {
  readonly type: "new-iban-onboarding";
};

type Next = {
  readonly type: "next";
};

type SkipInstruments = {
  readonly type: "skip-instruments";
};

type StartConfiguration = {
  readonly initiativeId: string;
  readonly mode: ConfigurationMode;
  readonly type: "start-configuration";
};

type UpdateInstrumentFailure = {
  readonly type: "update-instrument-failure";
  readonly walletId: string;
};

type UpdateInstrumentSuccess = {
  readonly enrolling: boolean;
  readonly type: "update-instrument-success";
  readonly walletId: string;
};
