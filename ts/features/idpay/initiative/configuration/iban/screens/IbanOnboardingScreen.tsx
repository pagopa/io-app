import { useActor } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { View as NBView } from "native-base";
import React from "react";
import { SafeAreaView, View, ScrollView } from "react-native";
import { Iban } from "../../../../../../../definitions/backend/Iban";
import IconProfileAlt from "../../../../../../components/core/icons/svg/IconProfileAlt";
import { Body } from "../../../../../../components/core/typography/Body";
import { H1 } from "../../../../../../components/core/typography/H1";
import { LabelSmall } from "../../../../../../components/core/typography/LabelSmall";
import { Link } from "../../../../../../components/core/typography/Link";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { LabelledItem } from "../../../../../../components/LabelledItem";
import BaseScreenComponent from "../../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../../i18n";
import { emptyContextualHelp } from "../../../../../../utils/emptyContextualHelp";
import { LOADING_TAG } from "../../../../../../utils/xstate";
import { useConfigurationMachineService } from "../../xstate/provider";

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
      <ScrollView style={[IOStyles.flex, IOStyles.horizontalContentPadding]}>
        <NBView spacer />
        <H1>{I18n.t("idpay.configuration.iban.onboarding.header")}</H1>
        <NBView spacer />
        <Body>{I18n.t("idpay.configuration.iban.onboarding.body")}</Body>
        <Link>{I18n.t("idpay.configuration.iban.onboarding.bodyLink")}</Link>
        <NBView spacer large />
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
        <NBView spacer />
        <LabelledItem
          label={I18n.t("idpay.configuration.iban.onboarding.nameAssignInput")}
          isValid={isIbanNameValid()}
          inputProps={{
            keyboardType: "default",
            returnKeyType: "done",
            value: ibanName,
            maxLength: 35,
            onChangeText: val => setIbanName(val)
          }}
        />
        <NBView spacer />
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
          <NBView hspacer />
          <LabelSmall color="bluegrey" weight="Regular">
            {I18n.t("idpay.configuration.iban.onboarding.bottomLabel")}
          </LabelSmall>
        </View>
      </ScrollView>
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
