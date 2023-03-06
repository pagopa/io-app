import * as P from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { InstrumentDTO } from "../../../../../../definitions/idpay/InstrumentDTO";
import { LOADING_TAG } from "../../../../../utils/xstate";
import { ConfigurationMode } from "./context";
import { IDPayInitiativeConfigurationMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayInitiativeConfigurationMachineType>;

type IDPayInstrumentsByIdWallet = {
  [idWallet: string]: InstrumentDTO;
};

const isLoadingSelector = (state: StateWithContext) =>
  state.hasTag(LOADING_TAG as never);

const selectInitiativeDetails = (state: StateWithContext) =>
  P.getOrElse(state.context.initiative, undefined);

const selectIsInstrumentsOnlyMode = (state: StateWithContext) =>
  state.context.mode === ConfigurationMode.INSTRUMENTS;

const selectIsIbanOnlyMode = (state: StateWithContext) =>
  state.context.mode === ConfigurationMode.IBAN;

const isLoadingIbanListSelector = (state: StateWithContext) =>
  state.matches("CONFIGURING_IBAN.LOADING_IBAN_LIST");

const ibanListSelector = (state: StateWithContext) =>
  P.getOrElse(state.context.ibanList, []);

const isUpsertingIbanSelector = (state: StateWithContext) =>
  state.matches("CONFIGURING_IBAN.ENROLLING_IBAN");

const selectIsLoadingInstruments = (state: StateWithContext) =>
  state.matches("CONFIGURING_INSTRUMENTS.LOADING_INSTRUMENTS");

const selectAreInstrumentsSkipped = (state: StateWithContext) =>
  state.context.areInstrumentsSkipped ?? false;

const selectIsUpsertingInstrument = (state: StateWithContext) =>
  state.matches("CONFIGURING_INSTRUMENTS.ENROLLING_INSTRUMENT") ||
  state.matches("CONFIGURING_INSTRUMENTS.DELETING_INSTRUMENT");

const selectEnrolledIban = createSelector(
  selectInitiativeDetails,
  ibanListSelector,
  (initiative, ibanList) => {
    if (initiative?.iban === undefined) {
      return undefined;
    }

    return ibanList.find(_ => _.iban === initiative.iban);
  }
);

const selectWalletInstruments = (state: StateWithContext) =>
  state.context.walletInstruments;

const selectInitiativeInstruments = (state: StateWithContext) =>
  state.context.initiativeInstruments;

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

const selectInstrumentStatuses = (state: StateWithContext) =>
  state.context.instrumentStatuses;

const instrumentStatusByIdWalletSelector = (idWallet: number) =>
  createSelector(
    selectInstrumentStatuses,
    statuses => statuses[idWallet] ?? P.some(undefined)
  );

const selectInstrumentToEnroll = (state: StateWithContext) =>
  state.context.instrumentToEnroll;

const isInstrumentEnrollingSelector = (idWallet: number) =>
  createSelector(
    selectInstrumentToEnroll,
    instrument => instrument?.idWallet === idWallet
  );

const failureSelector = (state: StateWithContext) => state.context.failure;

export {
  isLoadingSelector,
  isLoadingIbanListSelector,
  ibanListSelector,
  isUpsertingIbanSelector,
  selectInitiativeDetails,
  selectIsIbanOnlyMode,
  selectIsInstrumentsOnlyMode,
  selectIsLoadingInstruments,
  selectIsUpsertingInstrument,
  selectAreInstrumentsSkipped,
  selectEnrolledIban,
  selectWalletInstruments,
  initiativeInstrumentsByIdWalletSelector,
  instrumentStatusByIdWalletSelector,
  selectInstrumentToEnroll,
  isInstrumentEnrollingSelector,
  failureSelector
};
