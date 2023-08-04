/* eslint-disable functional/immutable-data */
import * as React from "react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";

import { OnboardingOutcome } from "../types";
import I18n from "../../../../i18n";
import { GenericErrorComponent } from "../../common/components/GenericErrorComponent";

type WalletOnboardingErrorProps = {
  onClose: () => void;
  outcome?: OnboardingOutcome;
};

const getOutcomeMessage = (outcome?: OnboardingOutcome): string =>
  pipe(
    outcome,
    O.fromNullable,
    O.fold(
      () => I18n.t("wallet.onboarding.generalError"),
      outcome => `Outcome ricevuto: ${outcome}` // TODO: Replace with the desired message to be defined
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
    onClose={onClose}
    pictogram="error"
    body={getOutcomeMessage(outcome)}
    title={I18n.t("wallet.onboarding.failure")}
  />
);

export default WalletOnboardingError;
