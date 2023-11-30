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

const FailureScreen = () => {
  const machine = useOnboardingMachineService();
  const failureOption = useSelector(machine, selectOnboardingFailure);

  const defaultCloseAction = React.useMemo(
    () => ({
      label: "Chiudi",
      accessibilityLabel: "Chiudi",
      onPress: () => machine.send({ type: "QUIT_ONBOARDING" })
    }),
    [machine]
  );

  const goToInitiativeAction = React.useMemo(
    () => ({
      label: "Vai all’iniziativa",
      accessibilityLabel: "Vai all’iniziativa",
      onPress: () => machine.send({ type: "SHOW_INITIATIVE_DETAILS" })
    }),
    [machine]
  );

  const genericErrorProps = React.useMemo<OperationResultScreenContentProps>(
    () => ({
      pictogram: "umbrellaNew",
      title: "Si è verificato un errore imprevisto",
      subtitle:
        "Siamo già a lavoro per risolverlo: ti invitiamo a riprovare più tardi.",
      action: defaultCloseAction
    }),
    [defaultCloseAction]
  );

  const mapFailureToContentProps = (
    failure: OnboardingFailureEnum
  ): OperationResultScreenContentProps => {
    switch (failure) {
      case OnboardingFailureEnum.INITIATIVE_NOT_STARTED:
        return {
          pictogram: "umbrellaNew",
          title: "Le iscrizioni non sono ancora aperte",
          subtitle:
            "Consulta le regole dell’iniziativa per scoprire quando sarà possibile aderire all’iniziativa.",
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.INITIATIVE_ENDED:
        return {
          pictogram: "umbrellaNew",
          title: "Le iscrizioni sono terminate",
          subtitle:
            "Non è più possibile aderire all’iniziativa. Per maggiori informazioni, contatta l’ente promotore.",
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.BUDGET_EXHAUSTED:
        return {
          pictogram: "fatalError",
          title: "I fondi messi a disposizione dall’ente sono terminati",
          subtitle:
            "Non è più possibile aderire all’iniziativa. Per maggiori informazioni, contatta l’ente promotore.",
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.UNSATISFIED_REQUIREMENTS:
        return {
          pictogram: "accessDenied",
          title: "Non hai i requisiti per aderire a questa iniziativa",
          subtitle:
            "I controlli di verifica hanno già dato esito negativo.\nSe pensi ci sia un errore, contatta l’ente promotore.",
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.USER_NOT_IN_WHITELIST:
        return {
          pictogram: "accessDenied",
          title: "Questa iniziativa non è rivolta a te",
          subtitle:
            "Il tuo Codice Fiscale non è incluso nella lista di chi ha diritto ai fondi previsti dall’iniziativa. Per maggiori informazioni, contatta l’ente promotore.",
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.ON_EVALUATION:
        return {
          pictogram: "pending",
          title: "L’ente sta valutando la tua domanda d’adesione",
          subtitle:
            "Quando pronto, riceverai l’esito tramite un messaggio in app.",
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.NOT_ELIGIBLE:
        return {
          pictogram: "completed",
          title: "Non risulti in graduatoria",
          subtitle: "Per maggiori informazioni, contatta l’ente promotore.",
          action: defaultCloseAction
        };
      case OnboardingFailureEnum.USER_ONBOARDED:
        return {
          pictogram: "success",
          title: "Hai già aderito a questa iniziativa",
          action: goToInitiativeAction
        };
      case OnboardingFailureEnum.USER_UNSUBSCRIBED:
        return {
          pictogram: "accessDenied",
          title: "Non puoi aderire di nuovo",
          subtitle:
            "Hai già effettuato il recesso da questa iniziativa. Per maggiori informazioni, contatta l’ente promotore.",
          action: defaultCloseAction,
          secondaryAction: goToInitiativeAction
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
