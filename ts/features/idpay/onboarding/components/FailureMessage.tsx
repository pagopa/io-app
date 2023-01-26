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

type Props = {
  type: OnboardingFailureType;
};

type OnboardingFailure = {
  picture: IOPictogramType;
  title: string;
  subtitle: string;
};

const FailureMessage = (props: Props) => {
  const failures: { [key in OnboardingFailureType]: OnboardingFailure } = {
    [OnboardingFailureType.NO_PERMISSION]: {
      picture: "question",
      title: "Non hai i requisiti per aderire a questa iniziativa",
      subtitle: "Non puoi richiedere il bonus!"
    },
    [OnboardingFailureType.GENERIC]: {
      picture: "umbrella",
      title: "C’è un problema sui nostri sistemi",
      subtitle:
        "Ci scusiamo per il disagio.\nTi invitiamo a riprovare più tardi."
    },
    [OnboardingFailureType.ALREADY_COMPLETED]: {
      picture: "inProgress",
      title: "Onboarding concluso",
      subtitle: "Hai già fatto l'onboarding per questa iniziativa"
    },
    [OnboardingFailureType.ONBOARDING_KO]: {
      picture: "question",
      title: "Onboarding fallito",
      subtitle: "L'adesione non è andata a buon fine"
    }
  };

  const failure = failures[props.type];

  if (failure === undefined) {
    return null;
  }

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
