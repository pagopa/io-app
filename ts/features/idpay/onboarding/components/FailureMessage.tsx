import { Text } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";
import {
  IOPictogramType,
  Pictogram
} from "../../../../components/core/pictograms";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { OnboardingFailureType } from "../xstate/failure";
import I18n from "../../../../i18n";

type Props = {
  type: OnboardingFailureType;
};

const FailureMessage = (props: Props) => {
  const failureIcons: { [key in OnboardingFailureType]: IOPictogramType } = {
    [OnboardingFailureType.NO_PERMISSION]: "question",
    [OnboardingFailureType.GENERIC]: "umbrella",
    [OnboardingFailureType.ALREADY_COMPLETED]: "inProgress",
    [OnboardingFailureType.ONBOARDING_KO]: "question"
  };
  return (
    <>
      <Pictogram name={failureIcons[props.type]} size={80} />
      <VSpacer size={16} />
      <H3 style={styles.title}>
        {I18n.t(`idpay.onboarding.failure.${props.type}.title`)}
      </H3>
      <VSpacer size={16} />
      <Text alignCenter={true}>
        {I18n.t(`idpay.onboarding.failure.${props.type}.subtitle`)}
      </Text>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center"
  }
});

export default FailureMessage;
