import * as P from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { LOADING_TAG } from "../../../../../utils/xstate";
import { IDPayInitiativeConfigurationMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayInitiativeConfigurationMachineType>;

type IDPayInstrumentsByIdWallet = {
  [idWallet: string]: InstrumentDTO;
};

const isLoadingSelector = (state: StateWithContext) =>
  state.hasTag(LOADING_TAG as never);

const isLoadingIbanListSelector = (state: StateWithContext) =>
  state.matches("CONFIGURING_IBAN.LOADING_IBAN_LIST");

const ibanListSelector = (state: StateWithContext) =>
  P.getOrElse(state.context.ibanList, []);

const isUpsertingIbanSelector = (state: StateWithContext) =>
  state.matches("CONFIGURING_IBAN.ADDING_IBAN");

const selectIsLoadingInstruments = (state: StateWithContext) =>
  state.matches("CONFIGURING_INSTRUMENTS.LOADING_INSTRUMENTS");

const selectIsUpsertingInstrument = (state: StateWithContext) =>
  state.matches("CONFIGURING_INSTRUMENTS.ADDING_INSTRUMENT");

const selectPagoPAInstruments = (state: StateWithContext) =>
  state.context.pagoPAInstruments;

const selectorPagoPAIntruments = createSelector(
  selectPagoPAInstruments,
  pagoPAInstruments => P.getOrElse(pagoPAInstruments, [])
);

const selectIDPayInstruments = (state: StateWithContext) =>
  state.context.idPayInstruments;

const selectorIDPayInstrumentsByIdWallet = createSelector(
  selectIDPayInstruments,
  idPayInstruments =>
    P.getOrElse(idPayInstruments, []).reduce<IDPayInstrumentsByIdWallet>(
      (acc, _) => {
        if (_.idWallet !== undefined) {
          // eslint-disable-next-line functional/immutable-data
          acc[_.idWallet] = _;
        }
        return acc;
      },
      {}
    )
);

export {
  isLoadingSelector,
  isLoadingIbanListSelector,
  ibanListSelector,
  isUpsertingIbanSelector,
  selectIsLoadingInstruments,
  selectIsUpsertingInstrument,
  selectorPagoPAIntruments,
  selectorIDPayInstrumentsByIdWallet
};
