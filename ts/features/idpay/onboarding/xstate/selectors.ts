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
import { LOADING_TAG, UPSERTING_TAG } from "../../../../utils/xstate";
import { Context, IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;

const selectIsLoading = (state: StateWithContext) =>
  state.tags.has(LOADING_TAG);

const isUpsertingSelector = (state: StateWithContext) =>
  state.hasTag(UPSERTING_TAG as never);

const selectRequiredCriteria = (state: StateWithContext) =>
  state.context.requiredCriteria;

const selectSelfDeclarationBoolAnswers = (state: StateWithContext) =>
  state.context.selfDeclarationBoolAnswers;

const selectMultiConsents = (state: StateWithContext) =>
  state.context.multiConsentsAnswers;

const selectCurrentPage = (state: StateWithContext) =>
  state.context.multiConsentsPage;
const selectTags = (state: StateWithContext) => state.tags;
const selectInitiative = (state: StateWithContext) => state.context.initiative;

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

const isLoadingSelector = createSelector(selectTags, tags =>
  tags.has(LOADING_TAG)
);
const isUpsertingSelector = createSelector(selectTags, tags =>
  tags.has(UPSERTING_TAG)
);

const initiativeDescriptionSelector = createSelector(
  selectInitiative,
  initiative => initiative?.description ?? undefined
);
const initiativeIDSelector = createSelector(
  selectInitiative,
  initiative => initiative?.initiativeId ?? undefined
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

const areAllSelfDeclarationsToggledSelector = createSelector(
  boolRequiredCriteriaSelector,
  selectSelfDeclarationBoolAnswers,
  (boolSelfDeclarations, answers) =>
    boolSelfDeclarations.length ===
    Object.values(answers).filter(answer => answer).length
);

export {
  selectServiceId,
  isUpsertingSelector,
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  getMultiRequiredCriteriaFromContext,
  getBoolRequiredCriteriaFromContext,
  criteriaToDisplaySelector,
  pdndCriteriaSelector,
  prerequisiteAnswerIndexSelector,
  isLoadingSelector,
  initiativeDescriptionSelector,
  isUpsertingSelector,
  initiativeIDSelector,
  selectIsLoading,
  selectSelfDeclarationBoolAnswers,
  areAllSelfDeclarationsToggledSelector
};
