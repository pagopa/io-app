import {
  FeatureInfo,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState } from "react";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { emptyContextualHelp } from "../../../../utils/contextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IdPayConfigurationMachineContext } from "../machine/provider";
import { Iban } from "../types/Iban";

export const IdPayIbanOnboardingScreen = () => {
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
      <TextInputValidation
        inputType="iban"
        errorMessage={I18n.t("idpay.configuration.iban.onboarding.error.iban")}
        onValidate={value =>
          pipe(
            Iban.decode(value),
            E.fold(
              () => false,
              () => true
            )
          )
        }
        value={iban.text}
        onChangeText={text => {
          setIban({
            value: pipe(Iban.decode(text), O.fromEither),
            text
          });
        }}
        counterLimit={27}
        placeholder="IBAN"
      />
      <VSpacer size={16} />
      <TextInputValidation
        counterLimit={35}
        errorMessage={I18n.t("idpay.configuration.iban.onboarding.error.name")}
        onValidate={val => val.length > 0}
        value={ibanName}
        onChangeText={val => setIbanName(val)}
        placeholder={I18n.t(
          "idpay.configuration.iban.onboarding.nameAssignInput"
        )}
      />
      <VSpacer size={16} />
      <FeatureInfo
        iconName="profile"
        body={I18n.t("idpay.configuration.iban.onboarding.bottomLabel")}
      />
    </IOScrollViewWithLargeHeader>
  );
};
