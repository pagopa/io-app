import { useActor } from "@xstate/react";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import {
  IOPictogramType,
  Pictogram
} from "../../../../components/core/pictograms";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import themeVariables from "../../../../theme/variables";
import { useOnboardingMachineService } from "../xstate/provider";

type OnboardingFailure = {
  picture: IOPictogramType;
  title: string;
  subtitle: string;
};

const FailureScreen = () => {
  const onboardingMachineService = useOnboardingMachineService();
  const [state, send] = useActor(onboardingMachineService);

  // TODO map localized content based on error in the state context
  const failures: { [name: string]: OnboardingFailure } = {
    noPermission: {
      picture: "question",
      title: "Non hai i requisiti per aderire a questa iniziativa",
      subtitle: "Non puoi richiedere il bonus!"
    },
    generic: {
      picture: "umbrella",
      title: "C’è un problema sui nostri sistemi",
      subtitle:
        "Ci scusiamo per il disagio.\nTi invitiamo a riprovare più tardi."
    }
  };

  const failureOption = pipe(
    state.context.error,
    O.fromNullable,
    O.map(error => {
      switch (error.code) {
        case 403:
          return failures.noPermission;
        default:
          return failures.generic;
      }
    })
  );

  const handleClosePress = () => {
    send({ type: "QUIT_ONBOARDING" });
  };

  const renderFailureContent = (failure: OnboardingFailure) => (
    <>
      <Pictogram name={failure.picture} size={80} />
      <View spacer={true} />
      <H3 style={styles.title}>{failure.title}</H3>
      <View spacer={true} />
      <Text alignCenter={true}>{failure.subtitle}</Text>
    </>
  );

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.errorContainer}>
        {O.isSome(failureOption) && renderFailureContent(failureOption.value)}
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
