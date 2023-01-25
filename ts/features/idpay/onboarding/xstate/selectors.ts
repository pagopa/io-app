/* eslint-disable no-underscore-dangle */
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { StateFrom } from "xstate";
import { _typeEnum as boolSelfDeclarationTypeEnum } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import {
  SelfDeclarationMultiDTO,
  _typeEnum as multiSelfCriteriaTypeEnum
} from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
import { IDPayOnboardingMachineType } from "./machine";

type StateWithContext = StateFrom<IDPayOnboardingMachineType>;
const multiRequiredCriteriaSelector = (state: StateWithContext) => {
  const requiredCriteria = state.context.requiredCriteria;
  if (requiredCriteria !== undefined) {
    return pipe(
      requiredCriteria,
      O.fold(
        () => [],
        val =>
          val.selfDeclarationList.filter(
            val => val._type === multiSelfCriteriaTypeEnum.multi
          )
      )
    ) as Array<SelfDeclarationMultiDTO>;
  }

  return [];
};

const multiRequiredCriteriaPageToDisplaySelector = (
  state: StateWithContext
) => {
  const criteria = multiRequiredCriteriaSelector(state);
  const nextPage = state.context.multiConsents.length;
  return criteria[nextPage];
};

const boolRequiredCriteriaSelector = (state: StateWithContext) => {
  const requiredCriteria = state.context.requiredCriteria;
  if (requiredCriteria !== undefined) {
    return pipe(
      requiredCriteria,
      O.fold(
        () => [],
        val =>
          val.selfDeclarationList.filter(
            val => val._type === boolSelfDeclarationTypeEnum.boolean
          )
      )
    );
  }

  return [];
};

export {
  multiRequiredCriteriaSelector,
  boolRequiredCriteriaSelector,
  multiRequiredCriteriaPageToDisplaySelector
};
