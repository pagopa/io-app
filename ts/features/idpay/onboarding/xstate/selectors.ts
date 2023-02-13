/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { SelfDeclarationDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { Context, IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;

const selectRequiredCriteria = (state: StateWithContext) =>
  state.context.requiredCriteria;
const selectMultiConsents = (state: StateWithContext) =>
  state.context.multiConsentsAnswers;
const selectCurrentPage = (state: StateWithContext) =>
  state.context.multiConsentsPage;

const selectServiceId = (state: StateWithContext) => state.context.serviceId;

const filterCriteria = <T extends SelfDeclarationDTO>(
  criteria: O.Option<RequiredCriteriaDTO> | undefined,
  filterFunc: typeof SelfDeclarationMultiDTO | typeof SelfDeclarationBoolDTO
) =>
  pipe(
    criteria,
    O.fromNullable,
    O.flatten,
    O.fold(
      () => [],
      some => some.selfDeclarationList.filter(filterFunc.is)
    )
  ) as Array<T>;

const multiRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfDeclarationMultiDTO>(
      requiredCriteria,
      SelfDeclarationMultiDTO
    )
);

const boolRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfDeclarationBoolDTO>(
      requiredCriteria,
      SelfDeclarationBoolDTO
    )
);

const criteriaToDisplaySelector = createSelector(
  multiRequiredCriteriaSelector,
  selectCurrentPage,
  (criteria, currentPage) => criteria[currentPage]
);

const pdndCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    pipe(
      requiredCriteria,
      O.fromNullable,
      O.flatten,
      O.fold(
        () => [],
        some => some.pdndCriteria
      )
    )
);

const prerequisiteAnswerIndexSelector = createSelector(
  criteriaToDisplaySelector,
  selectMultiConsents,
  selectCurrentPage,
  (currentCriteria, multiConsents, currentPage) =>
    multiConsents[currentPage]?.value === undefined
      ? undefined
      : currentCriteria.value.indexOf(multiConsents[currentPage]?.value)
);

const getMultiRequiredCriteriaFromContext = (context: Context) =>
  filterCriteria<SelfDeclarationMultiDTO>(
    context.requiredCriteria,
    SelfDeclarationMultiDTO
  );

const getBoolRequiredCriteriaFromContext = (context: Context) =>
  filterCriteria<SelfDeclarationBoolDTO>(
    context.requiredCriteria,
    SelfDeclarationBoolDTO
  );

export {
  selectServiceId,
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  getMultiRequiredCriteriaFromContext,
  getBoolRequiredCriteriaFromContext,
  criteriaToDisplaySelector,
  prerequisiteAnswerIndexSelector,
  pdndCriteriaSelector
};
