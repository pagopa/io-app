import { useActor } from "@xstate/react";
import { Text } from "native-base";
import React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import themeVariables from "../../../../theme/variables";
import FailureMessage from "../components/FailureMessage";
import { useOnboardingMachineService } from "../xstate/provider";

const FailureScreen = () => {
  const onboardingMachineService = useOnboardingMachineService();
  const [state, send] = useActor(onboardingMachineService);

  const handleClosePress = () => {
    send({ type: "QUIT_ONBOARDING" });
  };

  const failureType = state.context.failure;

  return (
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.errorContainer}>
        {failureType && <FailureMessage type={failureType} />}
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
  }
});

export default FailureScreen;
