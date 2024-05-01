import { IbanDTO } from "../../../../../definitions/idpay/IbanDTO";
import { IbanPutDTO } from "../../../../../definitions/idpay/IbanPutDTO";
import { GlobalEvents } from "../../../../xstate/types/events";
import * as Input from "./input";

export interface AutoInit {
  readonly type: "xstate.init";
  readonly input: Input.Input;
}

export interface ConfirmIbanOnboarding {
  readonly type: "confirm-iban-onboarding";
  readonly ibanBody: IbanPutDTO;
}

export interface NewIbanOnboarding {
  readonly type: "new-iban-onboarding";
}

export interface EnrollIban {
  readonly type: "enroll-iban";
  readonly iban: IbanDTO;
}

export interface EnrollInstrument {
  readonly type: "enroll-instrument";
  readonly walletId: string;
}

export interface DeleteInstrument {
  readonly type: "delete-instrument";
  readonly instrumentId: string;
  readonly walletId: string;
}

export interface UpdateInstrumentSuccess {
  readonly type: "update-instrument-success";
  readonly walletId: string;
  readonly enrolling: boolean;
}

export interface UpdateInstrumentFailure {
  readonly type: "update-instrument-failure";
  readonly walletId: string;
}

export interface SkipInstruments {
  readonly type: "skip-instruments";
}

export type Events =
  | AutoInit
  | NewIbanOnboarding
  | ConfirmIbanOnboarding
  | EnrollIban
  | EnrollInstrument
  | DeleteInstrument
  | UpdateInstrumentSuccess
  | UpdateInstrumentFailure
  | SkipInstruments
  | GlobalEvents;
