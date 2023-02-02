import { useSelector } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import {
  IOPictogramType,
  Pictogram
} from "../../../../components/core/pictograms";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { OnboardingFailure } from "../xstate/failure";
import { useOnboardingMachineService } from "../xstate/provider";
import { selectOnboardingFailure } from "../xstate/selectors";

const failurePictures: Record<OnboardingFailure, IOPictogramType> = {
  [OnboardingFailure.GENERIC]: "umbrella",
  [OnboardingFailure.NOT_STARTED]: "hourglass",
  [OnboardingFailure.ENDED]: "timeout",
  [OnboardingFailure.NO_BUDGET]: "timeout",
  [OnboardingFailure.SUSPENDED]: "timeout",
  [OnboardingFailure.NO_REQUIREMENTS]: "error",
  [OnboardingFailure.ON_EVALUATION]: "hourglass",
  [OnboardingFailure.NOT_ELIGIBLE]: "error",
  [OnboardingFailure.ONBOARDED]: "fireworks",
  [OnboardingFailure.UNSUBSCRIBED]: "error"
};

const FailureScreen = () => {
  const machine = useOnboardingMachineService();
  const failureOption = useSelector(machine, selectOnboardingFailure);

  const failure = pipe(
    failureOption,
    O.getOrElse(() => OnboardingFailure.GENERIC)
  );

  const isAlreadyOnboarded = failure === OnboardingFailure.ONBOARDED;

  const handleClosePress = () => {
    machine.send({ type: "QUIT_ONBOARDING" });
  };

  const handleNavigateToInitiativePress = () => {
    machine.send({ type: "SHOW_INITIATIVE_DETAILS" });
  };

  const renderCloseButton = () => {
    if (isAlreadyOnboarded) {
      return (
        <ButtonDefaultOpacity
          block={true}
          onPress={handleNavigateToInitiativePress}
        >
          <Text>
            {I18n.t("idpay.onboarding.failure.button.goToInitiative")}
          </Text>
        </ButtonDefaultOpacity>
      );
    }

    return (
      <ButtonDefaultOpacity
        block={true}
        bordered={true}
        onPress={handleClosePress}
      >
        <Text>{I18n.t("global.buttons.close")}</Text>
      </ButtonDefaultOpacity>
    );
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.errorContainer}>
        <Pictogram name={failurePictures[failure]} size={80} />
        <VSpacer size={16} />
        <H3 style={styles.title}>
          {I18n.t(`idpay.onboarding.failure.message.${failure}.title`)}
        </H3>
        <VSpacer size={16} />
        <Text alignCenter={true}>
          {I18n.t(`idpay.onboarding.failure.message.${failure}.subtitle`)}
        </Text>
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
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPadding
  },
  title: {
    textAlign: "center"
  }
});

export default FailureScreen;
