import { useActor } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Content, Form, View } from "native-base";
import React from "react";
import { SafeAreaView } from "react-native";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import { LabelledItem } from "../../../../../../components/LabelledItem";
import IconProfileAlt from "../../../../../../components/core/icons/svg/IconProfileAlt";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../../components/core/typography/LabelSmall";
import { Link } from "../../../../../../components/core/typography/Link";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { useConfigurationMachineService } from "../../xstate/provider";

const IbanOnboardingScreen = () => {
  const configurationMachine = useConfigurationMachineService();
  const [_, send] = useActor(configurationMachine);
  const customGoBack = () => send({ type: "BACK" });
  const [iban, setIban] = React.useState<string | undefined>(undefined);
  const [ibanName, setIbanName] = React.useState<string>("");
  const isIbanValid = () =>
    pipe(
      iban,
      O.fromNullable,
      O.fold(
        () => undefined,
        iban => E.isRight(Iban.decode(iban))
      )
    );
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
            isValid={isIbanValid()}
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
            label="Assegna un nome"
            inputProps={{
              keyboardType: "default",
              returnKeyType: "done",
              value: ibanName,
              maxLength: 35,
              onChangeText: val => setIbanName(val)
            }}
          />
          <View spacer />
          <View
            style={[
              IOStyles.row,
              {
                justifyContent: "center",
                alignItems: "center"
              }
            ]}
          >
            <IconProfileAlt size={30} color={IOColors.bluegrey} />
            <View hspacer />
            <LabelSmall color="bluegrey" weight="Regular">
              Puoi aggiungere o modificare i tuoi IBAN in qualsiasi momento
              visitando la sezione Profilo
            </LabelSmall>
          </View>
        </Form>
      </Content>
      <SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: "Continua",
            onPress: () => {
              if (iban !== undefined) {
                send({
                  type: "CONFIRM_IBAN",
                  ibanBody: { iban, description: ibanName }
                });
              }
            },

            disabled: !isIbanValid()
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default IbanOnboardingScreen;
