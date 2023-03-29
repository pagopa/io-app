import React from "react";
import { View, SafeAreaView, StyleSheet } from "react-native";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { useNavigationSwipeBackListener } from "../../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useConfigurationMachineService } from "../xstate/provider";

const styles = StyleSheet.create({
  greyCircle: {
    aspectRatio: 1,
    width: 206,
    height: 206,
    backgroundColor: IOColors.greyUltraLight,
    borderRadius: 100
  },
  justifyCenter: { justifyContent: "center" },
  adjustCenterHeight: {
    marginTop: -103, // 206 / 2 , the height of the circle; this allows to center the content vertically
    alignItems: "center"
  },
  textCenter: { textAlign: "center" }
});

const IbanConfigurationLanding = () => {
  const configurationMachine = useConfigurationMachineService();
  const customGoBack = () => configurationMachine.send({ type: "BACK" });

  useNavigationSwipeBackListener(() => {
    configurationMachine.send({ type: "BACK", skipNavigation: true });
  });

  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <View
        style={[
          IOStyles.flex,
          styles.justifyCenter,
          IOStyles.horizontalContentPadding
        ]}
      >
        <View
          style={[IOStyles.horizontalContentPadding, styles.adjustCenterHeight]}
        >
          <View style={styles.greyCircle}></View>
          <VSpacer size={24} />
          <H3>{I18n.t("idpay.configuration.iban.landing.header")}</H3>
          <VSpacer size={16} />
          <Body style={styles.textCenter}>
            {I18n.t("idpay.configuration.iban.landing.body")}
          </Body>
          <Body color="blue" weight="SemiBold">
            {I18n.t("idpay.configuration.iban.landing.bodyLink")}
          </Body>
        </View>
      </View>

      <SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: I18n.t("global.buttons.continue"),
            onPress: () => configurationMachine.send({ type: "NEXT" })
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default IbanConfigurationLanding;
