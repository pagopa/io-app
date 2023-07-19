/* eslint-disable functional/immutable-data */
import * as React from "react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import { OnboardingOutcome } from "../types";
import GenericErrorComponent from "../../../fci/components/GenericErrorComponent";

type WalletOnboardingErrorProps = {
  onClose: () => void;
  outcome?: OnboardingOutcome;
};

const getOutcomeMessage = (outcome?: OnboardingOutcome): string =>
  pipe(
    outcome,
    O.fromNullable,
    O.fold(
      () => "C'è stato un errore generico durante l'aggiunta della carta",
      outcome => `Outcome ricevuto: ${outcome}`
    )
  );

/**
 * Component used to show an error message when the wallet onboarding fails
 * TODO: Define the desired design of this component, for now it's just a generic error component
 * that shows an error message or the outcome received
 */
const WalletOnboardingError = ({
  onClose,
  outcome
}: WalletOnboardingErrorProps) => (
  <GenericErrorComponent
    onPress={onClose}
    subTitle={getOutcomeMessage(outcome)}
    title={"Errore durante l'aggiunta della carta"}
  />
);

export default WalletOnboardingError;
