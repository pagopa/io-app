import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { OnboardingFailureEnum } from "../types/OnboardingFailure";
import { useOnboardingMachineService } from "../xstate/provider";
import { selectOnboardingFailure } from "../xstate/selectors";
import I18n from "../../../../i18n";

const FailureScreen = () => {
  const machine = useOnboardingMachineService();
  const failureOption = useSelector(machine, selectOnboardingFailure);

  const defaultCloseAction = React.useMemo(
    () => ({
      label: I18n.t("global.buttons.close"),
      accessibilityLabel: I18n.t("global.buttons.close"),
      onPress: () => machine.send({ type: "QUIT_ONBOARDING" })
    }),
    [machine]
  );

  const goToInitiativeAction = React.useMemo(
    () => ({
      label: I18n.t("idpay.onboarding.failure.button.goToInitiative"),
      accessibilityLabel: I18n.t(
        "idpay.onboarding.failure.button.goToInitiative"
      ),
      onPress: () => machine.send({ type: "SHOW_INITIATIVE_DETAILS" })
    }),
    [machine]
  );

  const genericErrorProps = React.useMemo<OperationResultScreenContentProps>(
    () => ({
      pictogram: "umbrellaNew",
      title: I18n.t("idpay.onboarding.failure.message.GENERIC.title"),
      subtitle: I18n.t("idpay.onboarding.failure.message.GENERIC.subtitle"),
      action: defaultCloseAction
    }),
    [defaultCloseAction]
  );

  // TODO add missing pictograms IOBP-176
  const mapFailureToContentProps = (
    failure: OnboardingFailureEnum
  ): OperationResultScreenContentProps => {
    switch (failure) {
      case OnboardingFailureEnum.INITIATIVE_NOT_FOUND:
        return {
          pictogram: "search",
          title: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_NOT_FOUND.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_NOT_FOUND.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.UNSATISFIED_REQUIREMENTS:
        return {
          pictogram: "accessDenied",
          title: I18n.t(
            "idpay.onboarding.failure.message.UNSATISFIED_REQUIREMENTS.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.UNSATISFIED_REQUIREMENTS.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.USER_NOT_IN_WHITELIST:
        return {
          pictogram: "accessDenied",
          title: I18n.t(
            "idpay.onboarding.failure.message.USER_NOT_IN_WHITELIST.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.USER_NOT_IN_WHITELIST.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.INITIATIVE_NOT_STARTED:
        return {
          pictogram: "umbrellaNew",
          title: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_NOT_STARTED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_NOT_STARTED.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.INITIATIVE_ENDED:
        return {
          pictogram: "umbrellaNew",
          title: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_ENDED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_ENDED.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.BUDGET_EXHAUSTED:
        return {
          pictogram: "fatalError",
          title: I18n.t(
            "idpay.onboarding.failure.message.BUDGET_EXHAUSTED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.BUDGET_EXHAUSTED.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.USER_UNSUBSCRIBED:
        return {
          pictogram: "accessDenied",
          title: I18n.t(
            "idpay.onboarding.failure.message.USER_UNSUBSCRIBED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.USER_UNSUBSCRIBED.subtitle"
          ),
          action: defaultCloseAction,
          secondaryAction: goToInitiativeAction
        };
      case OnboardingFailureEnum.USER_ONBOARDED:
        return {
          pictogram: "success",
          title: I18n.t(
            "idpay.onboarding.failure.message.USER_ONBOARDED.title"
          ),
          action: goToInitiativeAction
        };
      case OnboardingFailureEnum.NOT_ELIGIBLE:
        return {
          pictogram: "completed",
          title: I18n.t("idpay.onboarding.failure.message.NOT_ELIGIBLE.title"),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.NOT_ELIGIBLE.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.ON_EVALUATION:
        return {
          pictogram: "pending",
          title: I18n.t("idpay.onboarding.failure.message.ON_EVALUATION.title"),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.ON_EVALUATION.subtitle"
          ),
          action: defaultCloseAction
        };
      default:
        return genericErrorProps;
    }
  };

  const contentProps = pipe(
    failureOption,
    O.map(mapFailureToContentProps),
    O.getOrElse(() => genericErrorProps)
  );

  return <OperationResultScreenContent {...contentProps} />;
};

export default FailureScreen;
