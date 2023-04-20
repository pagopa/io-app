import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { Body } from "../../../../../components/core/typography/Body";
import { H3 } from "../../../../../components/core/typography/H3";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useConfigurationMachineService } from "../xstate/provider";
import { Pictogram } from "../../../../../components/core/pictograms";

const styles = StyleSheet.create({
  mainContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 90
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "flex-start"
  },
  textCenter: { textAlign: "center" }
});

const IbanConfigurationLanding = () => {
  const configurationMachine = useConfigurationMachineService();
  const customGoBack = () => configurationMachine.send({ type: "BACK" });
  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <View
        style={[
          IOStyles.flex,
          styles.mainContainer,
          IOStyles.horizontalContentPadding
        ]}
      >
        <Pictogram name="ibanCard" size={240} />
        <VSpacer size={32} />
        <View style={[IOStyles.horizontalContentPadding, styles.textContainer]}>
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
