import {
  FooterWithButtons,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import themeVariables from "../../../../theme/variables";
import { useOnboardingMachineService } from "../xstate/provider";
import { isUpsertingSelector } from "../xstate/selectors";

const CompletionScreen = () => {
  const onboardingMachineService = useOnboardingMachineService();

  const isUpserting = useSelector(
    onboardingMachineService,
    isUpsertingSelector
  );

  const handleClosePress = () =>
    onboardingMachineService.send({ type: "QUIT_ONBOARDING" });

  if (isUpserting) {
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
