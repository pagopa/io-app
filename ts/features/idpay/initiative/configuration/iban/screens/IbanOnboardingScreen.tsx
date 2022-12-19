import { useActor } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import { Content, Form, View } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import { LabelledItem } from "../../../../../../components/LabelledItem";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { Link } from "../../../../../../components/core/typography/Link";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { useConfigurationMachineService } from "../../xstate/provider";
const IbanOnboardingScreen = () => {
  const configurationMachine = useConfigurationMachineService();
  const [_, send] = useActor(configurationMachine);
  const customGoBack = () => send({ type: "GO_BACK" });
  const [iban, setIban] = React.useState<string>("");
  const [ibanName, setIbanName] = React.useState<string>("");
  const isValidIban = (iban: string) => E.isRight(Iban.decode(iban));
  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <Content scrollEnabled={false}>
        <H1>Qual è il tuo IBAN?</H1>
        <Body>
          Aggiungi un conto corrente a te intestato. L’autodichiarazione è resa
          ai sensi del
        </Body>
        <Link>Dpr 28 dicembre 2000 n. 445 art 46 e 47 </Link>
        <View spacer large />
        <Form>
          <LabelledItem
            isValid={isValidIban(iban)}
            label="IBAN"
            inputMaskProps={{
              type: "custom",
              options: {
                mask: "AA99A9999999999999999999999"
              },
              keyboardType: "default",
              value: iban,
              onChangeText: val => setIban(val)
            }}
          />
          <View spacer />
          <LabelledItem
            // isValid={}
            label="Assegna un nome"
            inputProps={{
              keyboardType: "default",
              returnKeyType: "done",
              value: ibanName,
              maxLength: 35,
              onChangeText: val => setIbanName(val)
            }}
          />
        </Form>
      </Content>
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
export default IbanOnboardingScreen;
