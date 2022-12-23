import { useActor } from "@xstate/react";
import { Text, View } from "native-base";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { useConfigurationMachineService } from "../../xstate/provider";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../../../components/core/typography/H3";
import { Body } from "../../../../../../components/core/typography/Body";
import { IOColors } from "../../../../../../components/core/variables/IOColors";

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
  const [_, send] = useActor(configurationMachine);
  const customGoBack = () => send({ type: "BACK" });
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
          <View spacer large />
          <H3>Aggiungi un IBAN al tuo Profilo</H3>
          <View spacer />
          <Body style={styles.textCenter}>
            Salva i dati del tuo conto e ottieni più facilmente i rimborsi a te
            previsti.
          </Body>
          <Body color="blue" weight="SemiBold">
            Scopri di più
          </Body>
        </View>
      </View>

      <SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: "Continua",
            onPress: () => send({ type: "NEXT" })
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default IbanConfigurationLanding;
