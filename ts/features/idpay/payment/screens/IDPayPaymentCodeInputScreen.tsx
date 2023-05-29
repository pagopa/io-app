import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { useSelector } from "@xstate/react";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import { LabelledItem } from "../../../../components/LabelledItem";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { H1 } from "../../../../components/core/typography/H1";
import {
  IOLayoutCostants,
  IOStyles
} from "../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
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
    machine.send("PRE_AUTHORIZE_PAYMENT", inputState.code);

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={styles.wrapper}>
          <H1>Cosa devi pagare?</H1>
          <VSpacer size={16} />
          <Body>
            Inserisci il codice numerico di 6 cifre riportato sotto al codice
            QR.
          </Body>
          <VSpacer size={40} />
          <LabelledItem
            isValid={isInputValid}
            accessibilityLabel={"Codice Transazione"}
            inputMaskProps={{
              type: "custom",
              options: { mask: "999999" },
              keyboardType: "numeric",
              returnKeyType: "done",
              value: inputState.value,
              autoCapitalize: "none",
              placeholder: "Codice Transazione",
              onChangeText: value => {
                setInputState({
                  value,
                  code: pipe(
                    value,
                    O.fromNullable,
                    O.filter(NonEmptyString.is),
                    O.map(IDPayTransactionCode.decode)
                  )
                });
              }
            }}
          />
        </View>
        <FooterWithButtons
          type="SingleButton"
          leftButton={{
            title: "Continua",
            accessibilityLabel: "Continue",
            disabled: !isInputValid,
            onPress: navigateToPaymentAuthorization,
            isLoading
          }}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, marginHorizontal: IOLayoutCostants.appMarginDefault }
});

export { IDPayPaymentCodeInputScreen };
