import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { StateFrom } from "xstate";
import { _typeEnum as boolSelfDeclarationTypeEnum } from "../../../../../definitions/idpay/onboarding/SelfDeclarationBoolDTO";
import { _typeEnum as multiSelfCriteriaTypeEnum } from "../../../../../definitions/idpay/onboarding/SelfDeclarationMultiDTO";
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
            // eslint-disable-next-line no-underscore-dangle
            val => val._type === multiSelfCriteriaTypeEnum.multi
          )
      )
    );
  }

  return [];
};

const currentMultiRequiredCriteriaPageSelector = (state: StateWithContext) => {
  const criteria = multiRequiredCriteriaSelector(state);
  const currentPage = state.context.selfConsents.length - 1;
  if (currentPage >= 0) {
    // should always be true
    return criteria[currentPage];
  }
  return [];
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
            // eslint-disable-next-line no-underscore-dangle
            val => val._type === boolSelfDeclarationTypeEnum.boolean
          )
      )
    );
  }

  return [];
};

export { multiRequiredCriteriaSelector, boolRequiredCriteriaSelector };
