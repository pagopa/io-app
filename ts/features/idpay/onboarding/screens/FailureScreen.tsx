import * as O from "fp-ts/lib/Option";
import { useSelector } from "@xstate/react";
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

type FailureMessageProps = {
  failure: OnboardingFailure;
};

const FailureMessageComponent = (props: FailureMessageProps) => (
  <>
    <Pictogram name={failurePictures[props.failure]} size={80} />
    <VSpacer size={16} />
    <H3 style={styles.title}>
      {I18n.t(`idpay.onboarding.failure.${props.failure}.title`)}
    </H3>
    <VSpacer size={16} />
    <Text alignCenter={true}>
      {I18n.t(`idpay.onboarding.failure.${props.failure}.subtitle`)}
    </Text>
  </>
);

const FailureScreen = () => {
  const machine = useOnboardingMachineService();
  const failure = useSelector(machine, selectOnboardingFailure);

  const handleClosePress = () => {
    machine.send({ type: "QUIT_ONBOARDING" });
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.errorContainer}>
        {O.isSome(failure) && (
          <FailureMessageComponent failure={failure.value} />
        )}
      </View>
      <View style={styles.buttonContainer}>
        <ButtonDefaultOpacity
          block={true}
          bordered={true}
          onPress={handleClosePress}
        >
          <Text>{I18n.t("global.buttons.close")}</Text>
        </ButtonDefaultOpacity>
      </View>
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
