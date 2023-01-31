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

type OnboardingFailure = {
  picture: IOPictogramType;
  title: string;
  subtitle: string;
};

const FailureMessage = (props: Props) => {
  if (OnboardingFailureType[props.type] === undefined) {
    return null;
  }
  const failure: OnboardingFailure = {
    picture: I18n.t(
      `idpay.onboarding.failure.${props.type}.picture`
    ) as IOPictogramType,
    title: I18n.t(`idpay.onboarding.failure.${props.type}.title`),
    subtitle: I18n.t(`idpay.onboarding.failure.${props.type}.subtitle`)
  };

  return (
    <>
      <Pictogram name={failure.picture} size={80} />
      <VSpacer size={16} />
      <H3 style={styles.title}>{failure.title}</H3>
      <VSpacer size={16} />
      <Text alignCenter={true}>{failure.subtitle}</Text>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center"
  }
});

export default FailureMessage;
