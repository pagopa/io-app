import React from "react";
import { View } from "react-native";
import {
  IOPictogramType,
  Pictogram
} from "../../../../components/core/pictograms";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
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
      <View style={IOStyles.alignCenter}>
        <H3>
          {I18n.t(`idpay.onboarding.failure.${props.type}.title`)}
         </H3>
        <VSpacer size={16} />
        <Body style={{ textAlign: "center" }}>
          {I18n.t(`idpay.onboarding.failure.${props.type}.subtitle`)}
        </Body>
      </View>
    </>
  );
};

export default FailureMessage;
