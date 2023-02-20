/* eslint-disable no-underscore-dangle */
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/onboarding/RequiredCriteriaDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { SelfDeclarationDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { LOADING_TAG, UPSERTING_TAG } from "../../../../utils/xstate";
import { Context, IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;

const isUpsertingSelector = (state: StateWithContext) =>
  state.hasTag(UPSERTING_TAG as never);

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

const selectIsLoading = (state: StateWithContext) =>
  state.tags.has(LOADING_TAG);

const areAllSelfDeclarationsToggledSelector = createSelector(
  boolRequiredCriteriaSelector,
  boolSelfDeclarations =>
    boolSelfDeclarations.filter(
      selfDeclaration => selfDeclaration.value === false
    ).length === 0
);

export {
  selectServiceId,
  isUpsertingSelector,
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  getMultiRequiredCriteriaFromContext,
  getBoolRequiredCriteriaFromContext,
  criteriaToDisplaySelector,
  prerequisiteAnswerIndexSelector,
  pdndCriteriaSelector,
  selectIsLoading,
  areAllSelfDeclarationsToggledSelector
};
