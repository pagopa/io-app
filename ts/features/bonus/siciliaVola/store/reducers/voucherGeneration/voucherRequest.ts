import * as O from "fp-ts/lib/Option";
import { getType } from "typesafe-actions";
import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import {
  Company,
  Hospital,
  PartialVoucherRequest,
  University,
  SvBeneficiaryCategory
} from "../../../types/SvVoucherRequest";
import {
  FlightsDate,
  svGenerateVoucherSelectCategory,
  svGenerateVoucherSelectCompany,
  svGenerateVoucherSelectFlightsDate,
  svGenerateVoucherSelectHospital,
  svGenerateVoucherSelectUniversity,
  svGenerateVoucherStart,
  svGenerateVoucherUnderThresholdIncome
} from "../../actions/voucherGeneration";
import { Action } from "../../../../../../store/actions/types";
import { GlobalState } from "../../../../../../store/reducers/types";

export type VoucherRequestState = O.Option<PartialVoucherRequest>;
const INITIAL_STATE: VoucherRequestState = O.none;

/**
 * Utils needed to update only the under threshold value
 * @param state
 * @param underThresholdIncome
 */
const updateUnderThresholdIncome = (
  state: VoucherRequestState,
  underThresholdIncome: boolean
): VoucherRequestState =>
  pipe(
    state,
    O.chain(vR => {
      if (vR.category === "worker" || vR.category === "sick") {
        return O.some({ ...vR, underThresholdIncome });
      }
      return state;
    })
  );

/**
 * Utils needed to update only the university value
 * @param state
 * @param university
 */
const updateUniversity = (
  state: VoucherRequestState,
  university: University
): VoucherRequestState =>
  pipe(
    state,
    O.chain(vR => {
      if (vR.category === "student") {
        return O.some({ ...vR, university });
      }
      return state;
    })
  );

/**
 * Utils needed to update only the company value
 * @param state
 * @param company
 */
const updateCompany = (
  state: VoucherRequestState,
  company: Company
): VoucherRequestState =>
  pipe(
    state,
    O.chain(vR => {
      if (vR.category === "worker") {
        return O.some({ ...vR, company });
      }
      return state;
    })
  );

/**
 * Utils needed to update only the hospital value
 * @param state
 * @param hospital
 */
const updateHospital = (
  state: VoucherRequestState,
  hospital: Hospital
): VoucherRequestState =>
  pipe(
    state,
    O.chain(vR => {
      if (vR.category === "sick") {
        return O.some({ ...vR, hospital });
      }
      return state;
    })
  );

/**
 * Utils needed to update only the flights date values
 * @param state
 * @param flightsDate
 */
const updateFlightsDate = (
  state: VoucherRequestState,
  flightsDate: FlightsDate
): VoucherRequestState =>
  pipe(
    state,
    O.chain(vR =>
      O.some({
        ...vR,
        departureDate: flightsDate.departureDate,
        returnDate: flightsDate.returnDate
      })
    )
  );

const reducer = (
  state: VoucherRequestState = INITIAL_STATE,
  action: Action
): VoucherRequestState => {
  switch (action.type) {
    case getType(svGenerateVoucherStart):
      return INITIAL_STATE;
    case getType(svGenerateVoucherSelectCategory):
      return O.some({
        category: action.payload
      });

    case getType(svGenerateVoucherUnderThresholdIncome):
      return updateUnderThresholdIncome(state, action.payload);

    case getType(svGenerateVoucherSelectCompany):
      return updateCompany(state, action.payload);

    case getType(svGenerateVoucherSelectHospital):
      return updateHospital(state, action.payload);

    case getType(svGenerateVoucherSelectUniversity):
      return updateUniversity(state, action.payload);

    case getType(svGenerateVoucherSelectFlightsDate):
      return updateFlightsDate(state, action.payload);
  }
  return state;
};

export default reducer;

export const selectedBeneficiaryCategorySelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherGeneration.voucherRequest],
  (voucherRequest: VoucherRequestState): O.Option<SvBeneficiaryCategory> =>
    pipe(
      voucherRequest,
      O.fold(
        () => O.none,
        vR => O.some(vR.category)
      )
    )
);

export const voucherRequestSelector = createSelector(
  [(state: GlobalState) => state.bonus.sv.voucherGeneration.voucherRequest],
  (voucherRequest: VoucherRequestState): VoucherRequestState => voucherRequest
);
