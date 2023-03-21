import { useSelector } from "@xstate/react";
import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { useOnboardingMachineService } from "../xstate/provider";
import { isUpsertingSelector } from "../xstate/selectors";
import themeVariables from "../../../../theme/variables";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Pictogram } from "../../../../components/core/pictograms";

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
    <SafeAreaView style={IOStyles.flex}>
      <View style={styles.container}>
        <Pictogram name="completed" size={100} />
        <VSpacer size={16} />
        <H3> {I18n.t("idpay.onboarding.success.requestSent.title")}</H3>
        <VSpacer size={16} />
        <Body style={styles.message}>
          {I18n.t("idpay.onboarding.success.requestSent.body")}
        </Body>
      </View>
      <FooterWithButtons
        type="SingleButton"
        leftButton={{
          title: I18n.t("idpay.onboarding.success.button.continue"),
          testID: "closeButton",
          onPress: handleClosePress
        }}
      />
    </SafeAreaView>
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
