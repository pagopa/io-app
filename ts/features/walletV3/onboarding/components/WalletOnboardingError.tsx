/* eslint-disable functional/immutable-data */
import * as React from "react";

import { OnboardingOutcomeEnum, OnboardingOutcomeFailure } from "../types";
import I18n from "../../../../i18n";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import { openWebUrl } from "../../../../utils/url";
import {
  ONBOARDING_FAQ_ENABLE_3DS,
  ONBOARDING_OUTCOME_ERROR_PICTOGRAM
} from "../utils";

type WalletOnboardingErrorProps = {
  onClose: () => void;
  outcome: OnboardingOutcomeFailure;
};

type OnboardingErrorEnumKey = Exclude<
  keyof typeof OnboardingOutcomeEnum,
  "SUCCESS"
>;

/**
 * Component used to show an error message when the wallet onboarding fails with a specific outcome
 */
const WalletOnboardingError = ({
  onClose,
  outcome
}: WalletOnboardingErrorProps) => {
  const handleOnPressPrimaryAction = () => {
    onClose();
  };
  const handleOnPressSecondaryAction = () => {
    switch (outcome) {
      case OnboardingOutcomeEnum.AUTH_ERROR:
        openWebUrl(ONBOARDING_FAQ_ENABLE_3DS);
    }
  };

  const outcomeEnumKey = Object.keys(OnboardingOutcomeEnum)[
    Object.values(OnboardingOutcomeEnum).indexOf(
      outcome as OnboardingOutcomeEnum
    )
  ] as OnboardingErrorEnumKey;

  const renderSecondaryAction = () => {
    switch (outcome) {
      case OnboardingOutcomeEnum.AUTH_ERROR:
        return {
          label: I18n.t(`wallet.onboarding.failure.AUTH_ERROR.secondaryAction`),
          accessibilityLabel: I18n.t(
            `wallet.onboarding.failure.AUTH_ERROR.secondaryAction`
          ),
          onPress: handleOnPressSecondaryAction
        };
    }
    return undefined;
  };

  return (
    <OperationResultScreenContent
      title={I18n.t(`wallet.onboarding.failure.${outcomeEnumKey}.title`)}
      subtitle={I18n.t(`wallet.onboarding.failure.${outcomeEnumKey}.subtitle`)}
      pictogram={ONBOARDING_OUTCOME_ERROR_PICTOGRAM[outcome]}
      action={{
        label: I18n.t(
          `wallet.onboarding.failure.${outcomeEnumKey}.primaryAction`
        ),
        accessibilityLabel: I18n.t(
          `wallet.onboarding.failure.${outcomeEnumKey}.primaryAction`
        ),
        onPress: handleOnPressPrimaryAction
      }}
      secondaryAction={renderSecondaryAction()}
    />
  );
};

export default WalletOnboardingError;
