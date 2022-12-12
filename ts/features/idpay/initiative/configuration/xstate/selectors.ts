import * as P from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { IDPayInitiativeConfigurationMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayInitiativeConfigurationMachineType>;

type IDPayInstrumentsByIdWallet = {
  [idWallet: string]: InstrumentDTO;
};

const selectIsLoadingInstruments = (state: StateWithContext) =>
  state.matches("LOADING_INSTRUMENTS");

const selectIsUpsertingInstrument = (state: StateWithContext) =>
  state.matches("ADDING_INSTRUMENT");

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
  selectIsLoadingInstruments,
  selectIsUpsertingInstrument,
  selectorPagoPAIntruments,
  selectorIDPayInstrumentsByIdWallet
};
