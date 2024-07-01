import {
  FooterWithButtons,
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
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../components/core/typography/LabelSmall";
import { Link } from "../../../../components/core/typography/Link";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { useNavigationSwipeBackListener } from "../../../../hooks/useNavigationSwipeBackListener";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import { isLoadingSelector } from "../machine/selectors";

export const IbanOnboardingScreen = () => {
  const { useActorRef, useSelector } = IdPayConfigurationMachineContext;
  const machine = useActorRef();

  const customGoBack = () => machine.send({ type: "back" });
  const [iban, setIban] = React.useState<{
    text: string;
    value: O.Option<string>;
  }>({ text: "", value: O.none });

  const [ibanName, setIbanName] = React.useState<string>("");
  const isLoading = useSelector(isLoadingSelector);

  useNavigationSwipeBackListener(() => {
    machine.send({ type: "back", skipNavigation: true });
  });

  const isInputValid = O.isSome(iban.value) && ibanName.length > 0;

  return (
    <BaseScreenComponent
      goBack={customGoBack}
      headerTitle={I18n.t("idpay.configuration.headerTitle")}
      contextualHelp={emptyContextualHelp}
    >
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <VSpacer size={16} />
        <H1>{I18n.t("idpay.configuration.iban.onboarding.header")}</H1>
        <VSpacer size={16} />
        <Body>{I18n.t("idpay.configuration.iban.onboarding.body")}</Body>
        <Link>{I18n.t("idpay.configuration.iban.onboarding.bodyLink")}</Link>
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
          <Icon name="profile" size={30} color="bluegrey" />
          <HSpacer size={16} />
          <LabelSmall color="bluegrey" weight="Regular">
            {I18n.t("idpay.configuration.iban.onboarding.bottomLabel")}
          </LabelSmall>
        </View>
      </ScrollView>
      <FooterWithButtons
        type="SingleButton"
        primary={{
          type: "Solid",
          buttonProps: {
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
    </BaseScreenComponent>
  );
};
