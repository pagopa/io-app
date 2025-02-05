import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { RequiredCriteriaDTO } from "../../../../../definitions/idpay/RequiredCriteriaDTO";
import { SelfDeclarationBoolDTO } from "../../../../../definitions/idpay/SelfDeclarationBoolDTO";
import { SelfDeclarationDTO } from "../../../../../definitions/idpay/SelfDeclarationDTO";
import { SelfDeclarationMultiDTO } from "../../../../../definitions/idpay/SelfDeclarationMultiDTO";
import { SelfDeclarationTextDTO } from "../../../../../definitions/idpay/SelfDeclarationTextDTO";
import * as Context from "./context";
import { IdPayOnboardingMachine } from "./machine";

type MachineSnapshot = StateFrom<IdPayOnboardingMachine>;

export const selectOnboardingFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

const selectRequiredCriteria = (snapshot: MachineSnapshot) =>
  snapshot.context.requiredCriteria;

export const selectSelfDeclarationBoolAnswers = (snapshot: MachineSnapshot) =>
  snapshot.context.selfDeclarationsBoolAnswers;

export const selectCurrentMultiSelfDeclarationPage = (
  snapshot: MachineSnapshot
) => snapshot.context.selfDeclarationsMultiPage;

export const selectCurrentInputTextNumber = (snapshot: MachineSnapshot) =>
  snapshot.context.activeTextConsentPage;

export const selectInitiative = (snapshot: MachineSnapshot) =>
  snapshot.context.initiative;

export const selectServiceId = (snapshot: MachineSnapshot) =>
  snapshot.context.serviceId;

const filterCriteria = <T extends SelfDeclarationDTO>(
  criteria: O.Option<RequiredCriteriaDTO>,
  filterFunc:
    | typeof SelfDeclarationMultiDTO
    | typeof SelfDeclarationBoolDTO
    | typeof SelfDeclarationTextDTO
) =>
  pipe(
    criteria,
    O.fold(
      () => [],
      some => some.selfDeclarationList.filter(filterFunc.is)
    )
  ) as Array<T>;

export const multiRequiredCriteriaSelector = createSelector(
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

export const textRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfDeclarationTextDTO>(
      requiredCriteria,
      SelfDeclarationTextDTO
    )
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

export const getInputFormSelfDeclarationFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfDeclarationTextDTO>(
    context.requiredCriteria,
    SelfDeclarationTextDTO
  );

export const areAllSelfDeclarationsToggledSelector = createSelector(
  boolRequiredCriteriaSelector,
  selectSelfDeclarationBoolAnswers,
  (boolSelfDeclarations, answers) =>
    boolSelfDeclarations.length ===
    Object.values(answers).filter(answer => answer).length
);
