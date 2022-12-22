import { useActor } from "@xstate/react";
import { Text } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { useConfigurationMachineService } from "../../xstate/provider";

const IbanConfigurationLanding = () => {
  const configurationMachine = useConfigurationMachineService();
  const [_, send] = useActor(configurationMachine);
  const customGoBack = () => send({ type: "GO_BACK" });
  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <Text style={{ flex: 1 }}>IBAN CONFIGURATION LANDING</Text>
      <SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: "Continua",
            onPress: () => send({ type: "START_IBAN_ONBOARDING" })
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default IbanConfigurationLanding;
