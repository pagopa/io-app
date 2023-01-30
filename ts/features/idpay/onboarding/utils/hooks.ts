import { useSelector } from "@xstate/react";
import { MultiValueScreenNavigationType } from "../screens/MultiValuePrerequisitesScreen";
import { useOnboardingMachineService } from "../xstate/provider";
import {
  multiRequiredCriteriaSelector,
  pickedCriteriaSelector
} from "../xstate/selectors";

import { SelfConsentMultiDTO } from "../../../../../definitions/idpay/onboarding/SelfConsentMultiDTO";

export const useMultiPrerequisitesPagination = (
  navigation: MultiValueScreenNavigationType,
  machine: ReturnType<typeof useOnboardingMachineService>,
  page: number
) => {
  const multiPrerequisites = useSelector(
    machine,
    multiRequiredCriteriaSelector
  );
  const currentPage = multiPrerequisites[page];
  const isNextPageAvailable = multiPrerequisites[page + 1] !== undefined;
  const pickedCriteria = useSelector(machine, pickedCriteriaSelector);
  const arePrerequisitesUnanswered = () => pickedCriteria.includes(undefined);

  const navigateToPage = (targetPage: number) =>
    navigation.push("IDPAY_ONBOARDING_MULTI_SELF_DECLARATIONS", {
      page: targetPage
    });
  const confirmChoice = (choice: SelfConsentMultiDTO) => {
    machine.send("ADD_MULTI_CONSENT", {
      data: choice,
      page
    });
    if (isNextPageAvailable) {
      navigateToPage(page + 1);
    } else {
      if (arePrerequisitesUnanswered()) {
        // should never happen, but better safe than sorry
        navigateToPage(pickedCriteria.findIndex(item => item === undefined));
      } else {
        machine.send("ALL_CRITERIA_ACCEPTED");
      }
    }
  };
  const goBack = () => {
    if (page > 0) {
      navigation.pop();
    } else {
      machine.send("GO_BACK");
    }
  };

  return {
    currentPage,
    confirmChoice,
    goBack
  };
};
