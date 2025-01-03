import {
  Body,
  FooterActions,
  H2,
  IOColors,
  IOStyles,
  IOVisualCostants,
  TextInput,
  VSpacer
} from "@pagopa/io-app-design-system";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import { useHeaderSecondLevel } from "../../../../hooks/useHeaderSecondLevel";
import I18n from "../../../../i18n";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import { isLoadingSelector } from "../../common/machine/selectors";
import { IDPayTransactionCode } from "../common/types";
import { IdPayPaymentMachineContext } from "../machine/provider";

type InputState = {
  value?: string;
  code: O.Option<E.Either<unknown, string>>;
};

const IDPayPaymentCodeInputScreen = () => {
  const { useActorRef, useSelector } = IdPayPaymentMachineContext;
  const machine = useActorRef();

  const [inputState, setInputState] = React.useState<InputState>({
    value: undefined,
    code: O.none
  });

  const isInputValid = pipe(inputState.code, O.map(E.isRight), O.toUndefined);
  const isLoading = useSelector(isLoadingSelector);

  const navigateToPaymentAuthorization = () =>
    pipe(
      inputState.code,
      O.filter(E.isRight),
      O.map(trxCode => trxCode.right),
      O.map(trxCode => machine.send({ type: "authorize-payment", trxCode }))
    );

  useHeaderSecondLevel({
    title: I18n.t("idpay.payment.manualInput.title"),
    canGoBack: true,
    contextualHelp: emptyContextualHelp,
    supportRequest: true
  });

  return (
    <>
      <StatusBar
        barStyle={"dark-content"}
        translucent={false}
        backgroundColor={IOColors.white}
      />
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.wrapper}>
          <H2>{I18n.t("idpay.payment.manualInput.title")}</H2>
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
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: I18n.t("idpay.payment.manualInput.button"),
              disabled: !isInputValid || isLoading,
              onPress: navigateToPaymentAuthorization,
              loading: isLoading
            }
          }}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, marginHorizontal: IOVisualCostants.appMarginDefault }
});

export { IDPayPaymentCodeInputScreen };
