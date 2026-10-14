import {
  FeatureInfo,
  TextInputValidation,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { useState } from "react";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import { IbanSchema } from "../types";

export const IdPayIbanOnboardingScreen = () => {
  const machine = IdPayConfigurationMachineContext.useActorRef();

  const [iban, setIban] = useState<{
    text: string;
    value: string | undefined;
  }>({ text: "", value: undefined });

  const [ibanName, setIbanName] = useState<string>("");
  const isLoading =
    IdPayConfigurationMachineContext.useSelector(isLoadingSelector);

  const isInputValid = iban.value !== undefined && ibanName.length > 0;

  return (
    <IOScrollViewWithLargeHeader
      actions={{
        type: "SingleButton",
        primary: {
          label: I18n.t("global.buttons.continue"),
          loading: isLoading,
          disabled: isLoading || !isInputValid,
          onPress: () => {
            if (iban.value !== undefined) {
              machine.send({
                type: "confirm-iban-onboarding",
                ibanBody: { iban: iban.value, description: ibanName || "" }
              });
            }
          }
        }
      }}
      description={I18n.t("idpay.configuration.iban.onboarding.body")}
      headerActionsProp={{
        showHelp: true
      }}
      includeContentMargins
      title={{
        label: I18n.t("idpay.configuration.iban.onboarding.header"),
        section: I18n.t("idpay.configuration.headerTitle"),
        accessibilityLabel: I18n.t("idpay.configuration.iban.onboarding.header")
      }}
    >
      <TextInputValidation
        counterLimit={27}
        errorMessage={I18n.t("idpay.configuration.iban.onboarding.error.iban")}
        inputType="iban"
        onChangeText={text => {
          const result = IbanSchema.safeParse(text);
          setIban({
            value: result.success ? result.data : undefined,
            text
          });
        }}
        onValidate={value => IbanSchema.safeParse(value).success}
        placeholder={I18n.t("idpay.initiative.operationDetails.refund.iban")}
        value={iban.text}
      />
      <VSpacer size={16} />
      <TextInputValidation
        counterLimit={35}
        errorMessage={I18n.t("idpay.configuration.iban.onboarding.error.name")}
        onChangeText={val => setIbanName(val)}
        onValidate={val => val.length > 0}
        placeholder={I18n.t(
          "idpay.configuration.iban.onboarding.nameAssignInput"
        )}
        value={ibanName}
      />
      <VSpacer size={16} />
      <FeatureInfo
        body={I18n.t("idpay.configuration.iban.onboarding.bottomLabel")}
        iconName="profile"
      />
    </IOScrollViewWithLargeHeader>
  );
};
