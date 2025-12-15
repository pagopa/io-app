import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { useEffect, useMemo } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { getInstructionsButtonConfig } from "../../../../components/ui/utils/buttons";
import { useIOSelector } from "../../../../store/hooks";
import { idPayInitiativeConfigSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { getFullLocale } from "../../../../utils/locale";
import useIDPayFailureSupportModal from "../../common/hooks/useIDPayFailureSupportModal";
import {
  trackIDPayOnboardingErrorHelp,
  trackIDPayOnboardingFailure
} from "../analytics";
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
  const locale = getFullLocale();

  const initiativeId = pipe(
    initiative,
    O.map(i => i.initiativeId),
    O.toUndefined
  );

  const initiativeName = pipe(
    initiative,
    O.map(i => i.initiativeName),
    O.toUndefined
  );

  const { bottomSheet, present } = useIDPayFailureSupportModal(
    serviceId,
    initiativeId
  );

  const initiativeConfig = useIOSelector(
    idPayInitiativeConfigSelector(initiativeId)
  );

  const accessDeniedAction = initiativeConfig?.cac?.[locale]
    ? getInstructionsButtonConfig(initiativeConfig.cac[locale] ?? "")
    : undefined;

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
        onPress: () => {
          trackIDPayOnboardingErrorHelp({
            initiativeId,
            initiativeName,
            flow: "onboarding",
            reason: failureOption
          });

          present(OnboardingFailureEnum.ONBOARDING_GENERIC_ERROR);
        }
      },
      enableAnimatedPictogram: true,
      loop: true
    }),
    [failureOption, initiativeId, initiativeName, machine, present]
  );

  const mapFailureToContentProps = (
    failure: OnboardingFailureEnum
  ): OperationResultScreenContentProps => {
    switch (failure) {
      case OnboardingFailureEnum.ONBOARDING_INITIATIVE_NOT_FOUND:
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
      case OnboardingFailureEnum.ONBOARDING_UNSATISFIED_REQUIREMENTS:
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
      case OnboardingFailureEnum.ONBOARDING_USER_NOT_IN_WHITELIST:
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
      case OnboardingFailureEnum.ONBOARDING_INITIATIVE_NOT_STARTED:
        return {
          pictogram: "ended",
          title: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_NOT_STARTED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.INITIATIVE_NOT_STARTED.subtitle"
          ),
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.ONBOARDING_INITIATIVE_ENDED:
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
      case OnboardingFailureEnum.ONBOARDING_BUDGET_EXHAUSTED:
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
      case OnboardingFailureEnum.ONBOARDING_USER_UNSUBSCRIBED:
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
      case OnboardingFailureEnum.ONBOARDING_ALREADY_ONBOARDED:
        return {
          pictogram: "success",
          title: I18n.t(
            "idpay.onboarding.failure.message.USER_ONBOARDED.title"
          ),
          action: goToInitiativeAction
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
      case OnboardingFailureEnum.ONBOARDING_ON_EVALUATION:
        return {
          pictogram: "pending",
          title: I18n.t("idpay.onboarding.failure.message.ON_EVALUATION.title"),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.ON_EVALUATION.subtitle"
          ),
          action: defaultCloseAction
        };

      case OnboardingFailureEnum.ONBOARDING_FAMILY_UNIT_ALREADY_JOINED:
        return {
          pictogram: "accessDenied",
          title: I18n.t(
            "idpay.onboarding.failure.message.FAMILY_UNIT_ALREADY_JOINED.title"
          ),
          subtitle: I18n.t(
            "idpay.onboarding.failure.message.FAMILY_UNIT_ALREADY_JOINED.subtitle"
          ),
          action: defaultBackAction,
          secondaryAction: accessDeniedAction
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

  useEffect(() => {
    if (O.some(failureOption) && O.isSome(failureOption)) {
      trackIDPayOnboardingFailure({
        initiativeId,
        initiativeName,
        reason: failureOption
      });
    }
  }, [initiativeId, initiativeName, failureOption]);

  return (
    <>
      <OperationResultScreenContent {...contentProps} />
      {bottomSheet}
    </>
  );
};

export default IdPayFailureScreen;
