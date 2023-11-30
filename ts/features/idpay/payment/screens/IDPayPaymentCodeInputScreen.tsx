import {
  FooterWithButtons,
  IOStyles,
  IOVisualCostants,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useSelector } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { IDPayTransactionCode } from "../common/types";
import { usePaymentMachineService } from "../xstate/provider";
import { isLoadingSelector } from "../xstate/selectors";

type InputState = {
  value?: string;
  code: O.Option<E.Either<unknown, string>>;
};

const IDPayPaymentCodeInputScreen = () => {
  const machine = usePaymentMachineService();
  const [inputState, setInputState] = React.useState<InputState>({
    value: undefined,
    code: O.none
  });

  const isInputValid = pipe(inputState.code, O.map(E.isRight), O.toUndefined);
  const isLoading = useSelector(machine, isLoadingSelector);

  const navigateToPaymentAuthorization = () =>
    pipe(
      inputState.code,
      O.filter(E.isRight),
      O.map(trxCode => trxCode.right),
      O.map(trxCode => machine.send("START_AUTHORIZATION", { trxCode }))
    );

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <StatusBar barStyle={"dark-content"} translucent={false} />
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.wrapper}>
          <H1>{I18n.t("idpay.payment.manualInput.title")}</H1>
          <VSpacer size={16} />
          <Body>{I18n.t("idpay.payment.manualInput.subtitle")}</Body>
          <VSpacer size={40} />
          <TextInput
            textInputProps={{
              inputMode: "text",
              autoCapitalize: "characters",
              autoCorrect: false
            }}
            onChangeText={value => {
              setInputState({
                value,
                code: pipe(
                  value,
                  O.fromNullable,
                  O.filter(NonEmptyString.is),
                  O.map(IDPayTransactionCode.decode)
                )
              });
            }}
            placeholder={I18n.t("idpay.payment.manualInput.input")}
            accessibilityLabel={I18n.t("idpay.payment.manualInput.input")}
            value={inputState.value ?? ""}
            counterLimit={8}
          />
        </View>
        <FooterWithButtons
          type="SingleButton"
          primary={{
            type: "Solid",
            buttonProps: {
              label: I18n.t("idpay.payment.manualInput.button"),
              accessibilityLabel: I18n.t("idpay.payment.manualInput.button"),
              disabled: !isInputValid,
              onPress: navigateToPaymentAuthorization,
              loading: isLoading
            }
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, marginHorizontal: IOVisualCostants.appMarginDefault }
});

export { IDPayPaymentCodeInputScreen };
