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
import { useActor } from "@xstate/react";
import { LOADING_TAG } from "../../../../../../utils/xstate";

const IbanOnboardingScreen = () => {
  const configurationMachine = useConfigurationMachineService();
  const [state, send] = useActor(configurationMachine);
  const customGoBack = () => send({ type: "BACK" });
  const [iban, setIban] = React.useState<string | undefined>(undefined);
  const [ibanName, setIbanName] = React.useState<string | undefined>(undefined);
  const isLoading = state.tags.has(LOADING_TAG);
  const isIbanValid = () =>
    pipe(
      iban,
      O.fromNullable,
      O.fold(
        () => undefined,
        iban => E.isRight(Iban.decode(iban))
      )
    );

  const isIbanNameValid = () =>
    pipe(
      ibanName,
      O.fromNullable,
      O.fold(
        () => undefined,
        ibanName => ibanName.length > 0
      )
    );
  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <Content scrollEnabled={false}>
        <H1>{I18n.t("idpay.configuration.iban.onboarding.header")}</H1>
        <Body>{I18n.t("idpay.configuration.iban.onboarding.body")}</Body>
        <Link>{I18n.t("idpay.configuration.iban.onboarding.bodyLink")}</Link>
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
            label={I18n.t(
              "idpay.configuration.iban.onboarding.nameAssignInput"
            )}
            isValid={isIbanNameValid()}
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
              {I18n.t("idpay.configuration.iban.onboarding.bottomLabel")}
            </LabelSmall>
          </View>
        </Form>
      </Content>
      <SafeAreaView>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: I18n.t("global.buttons.continue"),
            isLoading,
            onPress: () => {
              const isDataSendable =
                iban !== undefined &&
                ibanName !== undefined &&
                ibanName.length > 0;
              if (isDataSendable) {
                send({
                  type: "CONFIRM_IBAN",
                  ibanBody: { iban, description: ibanName }
                });
              } else {
                setIbanName(""); // force re-render to show error in the UI
              }
            },

            disabled: isLoading || !isIbanValid()
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
export default IbanOnboardingScreen;
