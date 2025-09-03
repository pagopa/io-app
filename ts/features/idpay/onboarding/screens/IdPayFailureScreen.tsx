import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useMemo } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { getInstructionsButtonConfig } from "../../../../components/ui/utils/buttons";
import I18n from "../../../../i18n";
import useIDPayFailureSupportModal from "../../common/hooks/useIDPayFailureSupportModal";
import { IdPayOnboardingMachineContext } from "../machine/provider";
import {
  selectInitiative,
  selectOnboardingFailure,
  selectServiceId
} from "../machine/selectors";
import { OnboardingFailureEnum } from "../types/OnboardingFailure";

const IdPayFailureScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const failureOption = useSelector(selectOnboardingFailure);
  const serviceId = useSelector(selectServiceId);
  const initiative = useSelector(selectInitiative);

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  const { bottomSheet, present } = useIDPayFailureSupportModal(
    serviceId,
    initiativeId
  );

  const CAC_URL =
    "https://assistenza.ioapp.it/hc/it/articles/35337442750225-Non-riesco-ad-aggiungere-un-metodo-di-pagamento";

  const defaultCloseAction = useMemo(
    () => ({
      label: I18n.t("global.buttons.close"),
      accessibilityLabel: I18n.t("global.buttons.close"),
      onPress: () => machine.send({ type: "close" })
    }),
    [machine]
  );

  const defaultBackAction = useMemo(
    () => ({
      label: I18n.t("global.buttons.back"),
      accessibilityLabel: I18n.t("global.buttons.back"),
      onPress: () => machine.send({ type: "close" })
    }),
    [machine]
  );

  const goToInitiativeAction = useMemo(
    () => ({
      label: I18n.t("idpay.onboarding.failure.button.goToInitiative"),
      accessibilityLabel: I18n.t(
        "idpay.onboarding.failure.button.goToInitiative"
      ),
      onPress: () => machine.send({ type: "check-details" })
    }),
    [machine]
  );

  const genericErrorProps = useMemo<OperationResultScreenContentProps>(
    () => ({
      pictogram: "umbrella",
      title: I18n.t("idpay.onboarding.failure.message.GENERIC.title"),
      subtitle: I18n.t("idpay.onboarding.failure.message.GENERIC.subtitle"),
      action: {
        label: I18n.t("global.buttons.back"),
        accessibilityLabel: I18n.t("global.buttons.back"),
        onPress: () => machine.send({ type: "close" })
      },
      secondaryAction: {
        label: I18n.t(`wallet.onboarding.outcome.BE_KO.secondaryAction`),
        accessibilityLabel: I18n.t(
          `wallet.onboarding.outcome.BE_KO.secondaryAction`
        ),
        onPress: () => present(OnboardingFailureEnum.GENERIC)
      },
      enableAnimatedPictogram: true,
      loop: true
    }),
    [machine, present]
  );

  const mapFailureToContentProps = (
    failure: OnboardingFailureEnum
  ): OperationResultScreenContentProps => {
    switch (failure) {
      case OnboardingFailureEnum.INITIATIVE_NOT_FOUND:
        return {
          pictogram: "attention",
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
          pictogram: "error",
          title: I18n.t(
            "idpay.onboarding.failure.message.UNSATISFIED_REQUIREMENTS.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.UNSATISFIED_REQUIREMENTS.subtitle"
          ),
          action: defaultCloseAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case OnboardingFailureEnum.USER_NOT_IN_WHITELIST:
        return {
          pictogram: "error",
          title: I18n.t(
            "idpay.onboarding.failure.message.USER_NOT_IN_WHITELIST.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.USER_NOT_IN_WHITELIST.subtitle"
          ),
          action: defaultCloseAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case OnboardingFailureEnum.INITIATIVE_NOT_STARTED:
        return {
          pictogram: "eventClose",
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
          pictogram: "time",
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
          action: defaultCloseAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case OnboardingFailureEnum.USER_UNSUBSCRIBED:
        return {
          pictogram: "error",
          title: I18n.t(
            "idpay.onboarding.failure.message.USER_UNSUBSCRIBED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.USER_UNSUBSCRIBED.subtitle"
          ),
          action: defaultCloseAction,
          secondaryAction: goToInitiativeAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case OnboardingFailureEnum.USER_ONBOARDED:
        return {
          pictogram: "success",
          title: I18n.t(
            "idpay.onboarding.failure.message.USER_ONBOARDED.title"
          ),
          action: goToInitiativeAction,
          enableAnimatedPictogram: true,
          loop: false
        };
      case OnboardingFailureEnum.NOT_ELIGIBLE:
        return {
          pictogram: "ended",
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

      case OnboardingFailureEnum.FAMILY_UNIT_ALREADY_JOINED:
        return {
          pictogram: "accessDenied",
          title: I18n.t(
            "idpay.onboarding.failure.message.FAMILY_UNIT_ALREADY_JOINED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.FAMILY_UNIT_ALREADY_JOINED.subtitle"
          ),
          action: defaultBackAction,
          secondaryAction: getInstructionsButtonConfig(CAC_URL)
        };
      case OnboardingFailureEnum.ONBOARDING_WAITING_LIST:
        return {
          pictogram: "eventClose",
          title: I18n.t(
            "idpay.onboarding.failure.message.ONBOARDING_WAITING_LIST.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.ONBOARDING_WAITING_LIST.subtitle"
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

  return (
    <>
      <OperationResultScreenContent {...contentProps} />
      {bottomSheet}
    </>
  );
};

export default IdPayFailureScreen;
