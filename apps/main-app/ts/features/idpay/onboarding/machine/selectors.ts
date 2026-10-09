import { OnboardingInitiativeDTO } from "@io-app/api-types/generated/definitions/idpay/OnboardingInitiativeDTO";
import { SelfCriteriaBoolDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaBoolDTO";
import { SelfCriteriaInformativeDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaInformativeDTO";
import { SelfCriteriaMultiTypeDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaMultiTypeDTO";
import { SelfCriteriaTextDTO } from "@io-app/api-types/generated/definitions/idpay/SelfCriteriaTextDTO";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { StateFrom } from "xstate";

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

const filterMultiCriteria = <T>(criteria: O.Option<OnboardingInitiativeDTO>) =>
  pipe(
    criteria,
    O.fold(
      () => [],
      some =>
        some.beneficiaryRule?.selfDeclarationCriteria?.filter(el =>
          SelfCriteriaMultiTypeDTO.is(el)
        )
    )
  ) as Array<T>;

export const multiRequiredCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterMultiCriteria<SelfCriteriaMultiTypeDTO>(requiredCriteria)
);

const filterCriteria = <T>(
  criteria: O.Option<OnboardingInitiativeDTO>,
  filterFunc:
    | typeof SelfCriteriaBoolDTO
    | typeof SelfCriteriaInformativeDTO
    | typeof SelfCriteriaTextDTO
) =>
  pipe(
    criteria,
    O.fold(
      () => [],
      some =>
        some.beneficiaryRule?.selfDeclarationCriteria?.filter(filterFunc.is)
    )
  ) as Array<T>;

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
        some => some.beneficiaryRule?.automatedCriteria ?? []
      )
    )
);

// Self-declaration criteria of type "informative" carry BE-computed content
// (code, description, organization, value) that is rendered as-is in the
// PDND prerequisites screen, alongside the automated (PDND) criteria.
export const informativeCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    filterCriteria<SelfCriteriaInformativeDTO>(
      requiredCriteria,
      SelfCriteriaInformativeDTO
    )
);

export const familyUnitCompositionCriteriaSelector = createSelector(
  selectRequiredCriteria,
  requiredCriteria =>
    pipe(
      requiredCriteria,
      O.fold(
        () => undefined,
        some => some.general?.familyUnitComposition
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
  familyUnitCompositionCriteriaSelector,
  informativeCriteriaSelector,
  (
    multiCriteria,
    boolCriteria,
    textCriteria,
    pdndCriteria,
    familyCriteria,
    informativeCriteria
  ) =>
    (boolCriteria.length > 0 ? 1 : 0) +
    multiCriteria.length +
    textCriteria.length +
    (pdndCriteria.length > 0 || familyCriteria || informativeCriteria.length > 0
      ? 1
      : 0)
);

export const getMultiSelfDeclarationListFromContext = (
  context: Context.Context
) => filterMultiCriteria<SelfCriteriaMultiTypeDTO>(context.requiredCriteria);

export const getBooleanSelfDeclarationListFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfCriteriaBoolDTO>(
    context.requiredCriteria,
    SelfCriteriaBoolDTO
  );

export const getInformativeSelfDeclarationListFromContext = (
  context: Context.Context
) =>
  filterCriteria<SelfCriteriaInformativeDTO>(
    context.requiredCriteria,
    SelfCriteriaInformativeDTO
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
