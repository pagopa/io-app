import {
  Body,
  BodySmall,
  FooterActions,
  H2,
  HSpacer,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { ScrollView, View } from "react-native";
import { Iban } from "../../../../../definitions/backend/Iban";
import { LabelledItem } from "../../../../components/LabelledItem";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";

export const IbanOnboardingScreen = () => {
  const machine = IdPayConfigurationMachineContext.useActorRef();

  const [iban, setIban] = React.useState<{
    text: string;
    value: O.Option<string>;
  }>({ text: "", value: O.none });

  const [ibanName, setIbanName] = React.useState<string>("");
  const isLoading =
    IdPayConfigurationMachineContext.useSelector(isLoadingSelector);

  const isInputValid = O.isSome(iban.value) && ibanName.length > 0;

  useHeaderSecondLevel({
    title: I18n.t("idpay.configuration.headerTitle"),
    canGoBack: true,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <>
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <VSpacer size={16} />
        <H2>{I18n.t("idpay.configuration.iban.onboarding.header")}</H2>
        <VSpacer size={16} />
        <Body>{I18n.t("idpay.configuration.iban.onboarding.body")}</Body>
        <VSpacer size={24} />
        <LabelledItem
          isValid={O.isSome(iban.value)}
          label="IBAN"
          inputMaskProps={{
            type: "custom",
            options: {
              mask: "AA99A9999999999999999999999"
            },
            keyboardType: "default",
            value: iban.text,
            onChangeText: text =>
              setIban({ value: pipe(Iban.decode(text), O.fromEither), text })
          }}
        />
        <VSpacer size={16} />
        <LabelledItem
          label={I18n.t("idpay.configuration.iban.onboarding.nameAssignInput")}
          isValid={O.isSome(iban.value)}
          inputProps={{
            keyboardType: "default",
            returnKeyType: "done",
            value: ibanName,
            maxLength: 35,
            onChangeText: val => setIbanName(val)
          }}
        />
        <VSpacer size={16} />
        <View
          style={[
            IOStyles.row,
            {
              justifyContent: "center",
              alignItems: "center"
            }
          ]}
        >
          <Icon name="profile" size={24} color="bluegrey" />
          <HSpacer size={16} />
          <BodySmall color="bluegrey" weight="Regular">
            {I18n.t("idpay.configuration.iban.onboarding.bottomLabel")}
          </BodySmall>
        </View>
      </ScrollView>
      <FooterActions
        actions={{
          type: "SingleButton",
          primary: {
            label: I18n.t("global.buttons.continue"),
            loading: isLoading,
            disabled: isLoading || !isInputValid,
            onPress: () => {
              pipe(
                iban.value,
                O.map(iban =>
                  machine.send({
                    type: "confirm-iban-onboarding",
                    ibanBody: { iban, description: ibanName || "" }
                  })
                )
              );
            }
          }
        }}
      />
    </>
  );
};
