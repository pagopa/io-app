import { getType } from "typesafe-actions";
import { UTCISODateFromString } from "italia-ts-commons/lib/dates";
import { createSelector } from "reselect";
import { Action } from "../../../../../../store/actions/types";
import { svSetFilter } from "../../actions/voucherList";
import { GlobalState } from "../../../../../../store/reducers/types";

export type FilterState = {
  codiceVoucher?: string;
  idStato?: number;
  dataDa?: UTCISODateFromString;
  dataA?: UTCISODateFromString;
};

const INITIAL_STATE: FilterState = {
  codiceVoucher: undefined,
  idStato: undefined,
  dataDa: undefined,
  dataA: undefined
};

const reducer = (
  state: FilterState = INITIAL_STATE,
  action: Action
): FilterState => {
  switch (action.type) {
    case getType(svSetFilter):
      const { codiceVoucher, idStato, dataDa, dataA } = action.payload;
      return { codiceVoucher, idStato, dataDa, dataA };
  }

  return state;
};

export const svFiltersSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherList.filters],
  (filters: FilterState): FilterState => filters
);

export default reducer;
