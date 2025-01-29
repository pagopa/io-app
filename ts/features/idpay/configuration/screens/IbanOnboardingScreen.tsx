import {
  BodySmall,
  HSpacer,
  Icon,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import { View } from "react-native";
import { Iban } from "../../../../../definitions/backend/Iban";
import { LabelledItem } from "../../../../components/LabelledItem";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";

export const IbanOnboardingScreen = () => {
  const machine = IdPayConfigurationMachineContext.useActorRef();

  const [iban, setIban] = useState<{
    text: string;
    value: O.Option<string>;
  }>({ text: "", value: O.none });

  const [ibanName, setIbanName] = useState<string>("");
  const isLoading =
    IdPayConfigurationMachineContext.useSelector(isLoadingSelector);

  const isInputValid = O.isSome(iban.value) && ibanName.length > 0;

  return (
    <IOScrollViewWithLargeHeader
      includeContentMargins
      title={{
        label: I18n.t("idpay.configuration.iban.onboarding.header"),
        section: I18n.t("idpay.configuration.headerTitle"),
        accessibilityLabel: I18n.t("idpay.configuration.iban.onboarding.header")
      }}
      contextualHelp={emptyContextualHelp}
      headerActionsProp={{
        showHelp: true
      }}
      description={I18n.t("idpay.configuration.iban.onboarding.body")}
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
    >
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
    </IOScrollViewWithLargeHeader>
  );
};
