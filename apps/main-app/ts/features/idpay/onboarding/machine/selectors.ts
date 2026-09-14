import { OnboardingInitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/OnboardingInitiativeDTO";
import { SelfCriteriaBoolDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaBoolDTO";
import { SelfCriteriaMultiDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaMultiDTO";
import { SelfCriteriaMultiTypeDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaMultiTypeDTO";
import { SelfCriteriaTextDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaTextDTO";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";

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

const filterMultiCriteria = <T>(
  criteria: OnboardingInitiativeDTO | undefined
) =>
  (criteria?.beneficiaryRule?.selfDeclarationCriteria?.filter(
    el => el && (SelfCriteriaMultiTypeDTO.is(el) || SelfCriteriaMultiDTO.is(el))
  ) ?? []) as Array<T>;

export const multiRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterMultiCriteria<SelfCriteriaMultiDTO | SelfCriteriaMultiTypeDTO>(
      requiredCriteria
    )
);

const filterCriteria = <T>(
  criteria: OnboardingInitiativeDTO | undefined,
  filterFunc: typeof SelfCriteriaBoolDTO | typeof SelfCriteriaTextDTO
) =>
  (criteria?.beneficiaryRule?.selfDeclarationCriteria?.filter(filterFunc.is) ??
    []) as Array<T>;

export const boolRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfCriteriaBoolDTO>(requiredCriteria, SelfCriteriaBoolDTO)
);

export const pdndCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria => requiredCriteria?.beneficiaryRule?.automatedCriteria ?? []
);

export const familyUnitCompositionCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria => requiredCriteria?.general?.familyUnitComposition
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
  familyUnitCompositionCriteriaSelector,
  (multiCriteria, boolCriteria, textCriteria, pdndCriteria, familyCriteria) =>
    (boolCriteria.length > 0 ? 1 : 0) +
    multiCriteria.length +
    textCriteria.length +
    (pdndCriteria.length > 0 || familyCriteria ? 1 : 0)
);

export const getMultiSelfDeclarationListFromContext = (
  context: Context.Context
) =>
  filterMultiCriteria<SelfCriteriaMultiDTO | SelfCriteriaMultiTypeDTO>(
    context.requiredCriteria
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
