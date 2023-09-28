import React from "react";
import { useSelector } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { View, SafeAreaView, StyleSheet } from "react-native";
import {
  VSpacer,
  IOPictograms,
  Pictogram,
  ButtonSolid,
  ButtonOutline,
  IOStyles
} from "@pagopa/io-app-design-system";
import { H3 } from "../../../../components/core/typography/H3";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { OnboardingFailureEnum } from "../xstate/failure";
import { useOnboardingMachineService } from "../xstate/provider";
import { selectOnboardingFailure } from "../xstate/selectors";
import { Body } from "../../../../components/core/typography/Body";

const failurePictures: Record<OnboardingFailureEnum, IOPictograms> = {
  [OnboardingFailureEnum.GENERIC]: "umbrella",
  [OnboardingFailureEnum.UNEXPECTED]: "umbrella",
  [OnboardingFailureEnum.NOT_STARTED]: "hourglass",
  [OnboardingFailureEnum.ENDED]: "timeout",
  [OnboardingFailureEnum.NO_BUDGET]: "timeout",
  [OnboardingFailureEnum.SUSPENDED]: "timeout",
  [OnboardingFailureEnum.SESSION_EXPIRED]: "timeout",
  [OnboardingFailureEnum.NO_REQUIREMENTS]: "error",
  [OnboardingFailureEnum.ON_EVALUATION]: "hourglass",
  [OnboardingFailureEnum.NOT_ELIGIBLE]: "error",
  [OnboardingFailureEnum.ONBOARDED]: "fireworks",
  [OnboardingFailureEnum.UNSUBSCRIBED]: "error"
};

const FailureScreen = () => {
  const machine = useOnboardingMachineService();
  const failureOption = useSelector(machine, selectOnboardingFailure);

  const failure = pipe(
    failureOption,
    O.getOrElse(() => OnboardingFailureEnum.GENERIC)
  );

  const isAlreadyOnboarded = failure === OnboardingFailureEnum.ONBOARDED;

  const handleClosePress = () => {
    machine.send({ type: "QUIT_ONBOARDING" });
  };

  const handleNavigateToInitiativePress = () => {
    machine.send({ type: "SHOW_INITIATIVE_DETAILS" });
  };

  const renderCloseButton = () => {
    if (isAlreadyOnboarded) {
      return (
        <ButtonSolid
          label={I18n.t("idpay.onboarding.failure.button.goToInitiative")}
          accessibilityLabel={I18n.t(
            "idpay.onboarding.failure.button.goToInitiative"
          )}
          onPress={handleNavigateToInitiativePress}
          fullWidth={true}
        />
      );
    }

    return (
      <ButtonOutline
        label={I18n.t("global.buttons.close")}
        accessibilityLabel={I18n.t("global.buttons.close")}
        onPress={handleClosePress}
        fullWidth={true}
      />
    );
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.errorContainer}>
        <Pictogram name={failurePictures[failure]} size={80} />
        <VSpacer size={16} />
        <H3 style={styles.title}>
          {I18n.t(`idpay.onboarding.failure.message.${failure}.title`, {
            defaultValue: I18n.t(
              "idpay.onboarding.failure.message.GENERIC.title"
            )
          })}
        </H3>
        <VSpacer size={16} />
        <Body style={{ textAlign: "center" }}>
          {I18n.t(`idpay.onboarding.failure.message.${failure}.subtitle`, {
            defaultValue: I18n.t(
              "idpay.onboarding.failure.message.GENERIC.subtitle"
            )
          })}
        </Body>
      </View>
      <View style={styles.buttonContainer}>{renderCloseButton()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 56
  },
  buttonContainer: {
    padding: themeVariables.contentPadding
  },
  title: {
    textAlign: "center"
  }
});

export default FailureScreen;
