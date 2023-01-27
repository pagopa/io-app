/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { SelfDeclarationDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;
const selectRequiredCriteria = (state: StateWithContext) =>
  state.context.requiredCriteria;
type FilterType = typeof SelfDeclarationDTO.is;
const discernCriteria = (
  criteria: O.Option<RequiredCriteriaDTO> | undefined,
  filterFunc: FilterType
) =>
  pipe(
    criteria,
    O.fromNullable,
    O.flatten,
    O.fold(
      () => [],
      some => some.selfDeclarationList.filter(filterFunc)
    )
  );

const multiRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    discernCriteria(
      requiredCriteria,
      SelfDeclarationMultiDTO.is
    ) as Array<SelfDeclarationMultiDTO>
);

const pickedCriteriaSelector = createSelector(
  (state: StateWithContext) => state.context.multiConsents,
  val => val ?? []
);

const boolRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    discernCriteria(
      requiredCriteria,
      SelfDeclarationBoolDTO.is
    ) as Array<SelfDeclarationBoolDTO>
);

export {
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  pickedCriteriaSelector
};
