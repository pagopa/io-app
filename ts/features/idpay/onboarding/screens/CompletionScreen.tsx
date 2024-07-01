import {
  FooterWithButtons,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { isLoadingSelector } from "../../../../xstate/selectors";
import { IdPayOnboardingMachineContext } from "../machine/provider";

const CompletionScreen = () => {
  const { useActorRef, useSelector } = IdPayOnboardingMachineContext;
  const machine = useActorRef();

  const isLoading = useSelector(isLoadingSelector);

  const handleClosePress = () => machine.send({ type: "close" });

  if (isLoading) {
    return (
      <SafeAreaView style={IOStyles.flex}>
        <BaseScreenComponent
          goBack={true}
          headerTitle={I18n.t("idpay.onboarding.headerTitle")}
        >
          <LoadingSpinnerOverlay isLoading={true}></LoadingSpinnerOverlay>
        </BaseScreenComponent>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.container}>
          <Pictogram name="completed" size={120} />
          <VSpacer size={16} />
          <H3> {I18n.t("idpay.onboarding.success.requestSent.title")}</H3>
          <VSpacer size={16} />
          <Body style={styles.message}>
            {I18n.t("idpay.onboarding.success.requestSent.body")}
          </Body>
        </View>
      </SafeAreaView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
            label: I18n.t("idpay.onboarding.success.button.continue"),
            accessibilityLabel: I18n.t(
              "idpay.onboarding.success.button.continue"
            ),
            onPress: handleClosePress,
            testID: "closeButton"
          }
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: themeVariables.contentPaddingLarge
  },
  message: {
    textAlign: "center"
  }
});

export default CompletionScreen;
