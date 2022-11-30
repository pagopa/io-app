import * as P from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { InstrumentDTO } from "../../../../../../definitions/idpay/wallet/InstrumentDTO";
import { Context } from "./machine";

type State = {
  context: Context;
};

type IDPayInstrumentsByIdWallet = {
  [idWallet: string]: InstrumentDTO;
};

const selectIDPayInstruments = (state: State) => {
  // eslint-disable-next-line no-console
  console.log("selectIDPayInstruments", state.context);
  return state.context.idPayInstruments;
};

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

export { selectorIDPayInstrumentsByIdWallet };
