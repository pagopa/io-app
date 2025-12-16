import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { InstrumentDTO } from "../../../../../definitions/idpay/InstrumentDTO";
import { ConfigurationMode } from "../types";
import { IdPayConfigurationMachine } from "./machine";

type MachineSnapshot = StateFrom<IdPayConfigurationMachine>;

type IDPayInstrumentsByIdWallet = {
  [idWallet: string]: InstrumentDTO;
};

const selectInitiativeDetails = (snapshot: MachineSnapshot) =>
  snapshot.context.initiative;

const selectIsInstrumentsOnlyMode = (snapshot: MachineSnapshot) =>
  snapshot.context.mode === ConfigurationMode.INSTRUMENTS;

const selectIsIbanOnlyMode = (snapshot: MachineSnapshot) =>
  snapshot.context.mode === ConfigurationMode.IBAN;

const isLoadingIbanListSelector = (snapshot: MachineSnapshot) =>
  snapshot.matches("ConfiguringIban");

const ibanListSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.ibanList;

const selectAreInstrumentsSkipped = (snapshot: MachineSnapshot) =>
  snapshot.context.areInstrumentsSkipped ?? false;

const selectEnrolledIban = createSelector(
  selectInitiativeDetails,
  ibanListSelector,
  (initiativeOption, ibanList) => {
    const initiative = O.toUndefined(initiativeOption);
    if (initiative?.iban === undefined) {
      return undefined;
    }
    return ibanList.find(_ => _.iban === initiative.iban);
  }
);

const selectWalletInstruments = (snapshot: MachineSnapshot) =>
  snapshot.context.walletInstruments;

const selectInitiativeInstruments = (snapshot: MachineSnapshot) =>
  snapshot.context.initiativeInstruments;

const initiativeInstrumentsByIdWalletSelector = createSelector(
  selectInitiativeInstruments,
  instruments =>
    instruments.reduce<IDPayInstrumentsByIdWallet>((acc, instrument) => {
      if (instrument.idWallet !== undefined) {
        // eslint-disable-next-line functional/immutable-data
        acc[instrument.idWallet] = instrument;
      }
      return acc;
    }, {})
);

const selectInstrumentStatuses = (snapshot: MachineSnapshot) =>
  snapshot.context.instrumentStatuses;

const isUpsertingInstrumentSelector = createSelector(
  selectInstrumentStatuses,
  statuses => Object.values(statuses).some(pot.isLoading)
);

const instrumentStatusByIdWalletSelector = (idWallet: number) =>
  createSelector(
    selectInstrumentStatuses,
    statuses => statuses[idWallet] ?? pot.some(undefined)
  );

const failureSelector = (snapshot: MachineSnapshot) => snapshot.context.failure;

export {
  failureSelector,
  ibanListSelector,
  initiativeInstrumentsByIdWalletSelector,
  instrumentStatusByIdWalletSelector,
  isLoadingIbanListSelector,
  isUpsertingInstrumentSelector,
  selectAreInstrumentsSkipped,
  selectEnrolledIban,
  selectInitiativeDetails,
  selectIsIbanOnlyMode,
  selectIsInstrumentsOnlyMode,
  selectWalletInstruments
};
