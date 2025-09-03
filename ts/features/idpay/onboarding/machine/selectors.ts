import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";
import { InitiativeBeneficiaryRuleDTO } from "../../../../../definitions/idpay/InitiativeBeneficiaryRuleDTO";
import { SelfCriteriaBoolDTO } from "../../../../../definitions/idpay/SelfCriteriaBoolDTO";
import { SelfCriteriaMultiDTO } from "../../../../../definitions/idpay/SelfCriteriaMultiDTO";
import { SelfCriteriaTextDTO } from "../../../../../definitions/idpay/SelfCriteriaTextDTO";
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

const filterCriteria = <T>(
  criteria: O.Option<InitiativeBeneficiaryRuleDTO>,
  filterFunc:
    | typeof SelfCriteriaMultiDTO
    | typeof SelfCriteriaBoolDTO
    | typeof SelfCriteriaTextDTO
) =>
  pipe(
    criteria,
    O.fold(
      () => [],
      some => some.selfDeclarationCriteria?.filter(filterFunc.is)
    )
  ) as Array<T>;

export const multiRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfCriteriaMultiDTO>(requiredCriteria, SelfCriteriaMultiDTO)
);

export const boolRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfCriteriaBoolDTO>(requiredCriteria, SelfCriteriaBoolDTO)
);

export const pdndCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    pipe(
      requiredCriteria,
      O.fold(
        () => [],
        some => some.automatedCriteria
      )
    )
);

export const textRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfCriteriaTextDTO>(requiredCriteria, SelfCriteriaTextDTO)
);

export const stepperCountSelector = createSelector(
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  textRequiredCriteriaSelector,
  pdndCriteriaSelector,
  (multiCriteria, boolCriteria, textCriteria, pdndCriteria) =>
    boolCriteria.length +
    multiCriteria.length +
    textCriteria.length +
    (pdndCriteria ? 1 : 0)
);

export const getMultiSelfDeclarationListFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfCriteriaMultiDTO>(
    context.requiredCriteria,
    SelfCriteriaMultiDTO
  );

export const getBooleanSelfDeclarationListFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfCriteriaBoolDTO>(
    context.requiredCriteria,
    SelfCriteriaBoolDTO
  );

export const getInputFormSelfDeclarationFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfCriteriaTextDTO>(
    context.requiredCriteria,
    SelfCriteriaTextDTO
  );

export const areAllSelfDeclarationsToggledSelector = createSelector(
  boolRequiredCriteriaSelector,
  selectSelfDeclarationBoolAnswers,
  (boolSelfDeclarations, answers) =>
    boolSelfDeclarations.length ===
    Object.values(answers).filter(answer => answer).length
);
