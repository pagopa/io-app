/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { SnapshotFrom } from "xstate";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import { SelfDeclarationDTO } from "../../../../../definitions/idpay/SelfDeclarationDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/SelfDeclarationMultiDTO";
import * as Context from "./context";
import { idPayOnboardingMachine } from "./machine";

type MachineSnapshot = SnapshotFrom<typeof idPayOnboardingMachine>;

export const selectOnboardingFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

const selectRequiredCriteria = (snapshot: MachineSnapshot) =>
  snapshot.context.requiredCriteria;

export const selectSelfDeclarationBoolAnswers = (snapshot: MachineSnapshot) =>
  snapshot.context.selfDeclarationsBoolAnswers;

const selectMultiConsents = (snapshot: MachineSnapshot) =>
  snapshot.context.selfDeclarationsMultiAnwsers;

const selectCurrentPage = (snapshot: MachineSnapshot) =>
  snapshot.context.selfDeclarationsMultiPage;

export const selectInitiative = (snapshot: MachineSnapshot) =>
  snapshot.context.initiative;

export const selectServiceId = (snapshot: MachineSnapshot) =>
  snapshot.context.serviceId;

const filterCriteria = <T extends SelfDeclarationDTO>(
  criteria: O.Option<RequiredCriteriaDTO>,
  filterFunc: typeof SelfDeclarationMultiDTO | typeof SelfDeclarationBoolDTO
) =>
  pipe(
    criteria,
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

export const boolRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfDeclarationBoolDTO>(
      requiredCriteria,
      SelfDeclarationBoolDTO
    )
);

export const criteriaToDisplaySelector = createSelector(
  multiRequiredCriteriaSelector,
  selectCurrentPage,
  (criteria, currentPage) => criteria[currentPage]
);

export const pdndCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    pipe(
      requiredCriteria,
      O.fold(
        () => [],
        some => some.pdndCriteria
      )
    )
);

export const prerequisiteAnswerIndexSelector = createSelector(
  criteriaToDisplaySelector,
  selectMultiConsents,
  selectCurrentPage,
  (currentCriteria, multiConsents, currentPage) =>
    multiConsents[currentPage]?.value === undefined
      ? undefined
      : currentCriteria.value.indexOf(multiConsents[currentPage]?.value)
);

export const getMultiSelfDeclarationListFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfDeclarationMultiDTO>(
    context.requiredCriteria,
    SelfDeclarationMultiDTO
  );

export const getBooleanSelfDeclarationListFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfDeclarationBoolDTO>(
    context.requiredCriteria,
    SelfDeclarationBoolDTO
  );

export const areAllSelfDeclarationsToggledSelector = createSelector(
  boolRequiredCriteriaSelector,
  selectSelfDeclarationBoolAnswers,
  (boolSelfDeclarations, answers) =>
    boolSelfDeclarations.length ===
    Object.values(answers).filter(answer => answer).length
);
