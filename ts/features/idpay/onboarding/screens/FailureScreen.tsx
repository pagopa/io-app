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
import { OnboardingFailureType } from "../xstate/failure";
import { useOnboardingMachineService } from "../xstate/provider";
import { failureSelector } from "../xstate/selectors";

const failurePictures: Record<OnboardingFailureType, IOPictogramType> = {
  [OnboardingFailureType.GENERIC]: "umbrella",
  [OnboardingFailureType.NO_PERMISSION]: "question",
  [OnboardingFailureType.ALREADY_COMPLETED]: "inProgress",
  [OnboardingFailureType.ONBOARDING_KO]: "question"
};

type FailureMessageProps = {
  failure: OnboardingFailureType;
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
  const failure = useSelector(machine, failureSelector);

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
          <Text>{"Chiudi"}</Text>
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
