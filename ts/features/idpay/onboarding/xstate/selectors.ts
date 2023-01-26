/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;
const selectRequiredCriteria = (state: StateWithContext) =>
  state.context.requiredCriteria;

const multiRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    pipe(
      requiredCriteria,
      O.fromNullable,
      O.flatten,
      O.fold(
        () => [],
        val => val.selfDeclarationList.filter(SelfDeclarationMultiDTO.is)
      )
    )
);

const multiRequiredCriteriaPageToDisplaySelector = (
  state: StateWithContext
) => {
  const criteria = multiRequiredCriteriaSelector(state);
  const nextPage = state.context.multiConsents?.length ?? 0;
  return criteria[nextPage];
};

const boolRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    pipe(
      requiredCriteria,
      O.fromNullable,
      O.flatten,
      O.fold(
        () => [],
        val => val.selfDeclarationList.filter(SelfDeclarationBoolDTO.is)
      )
    )
);

export {
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  multiRequiredCriteriaPageToDisplaySelector
};
