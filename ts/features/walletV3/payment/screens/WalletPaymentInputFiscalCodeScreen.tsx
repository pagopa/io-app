import {
  Body,
  ButtonSolid,
  ContentWrapper,
  H2,
  IOStyles,
  TextInputValidation,
  VSpacer
} from "@pagopa/io-app-design-system";
import {
  AmountInEuroCents,
  PaymentNoticeNumberFromString,
  RptId
} from "@pagopa/io-pagopa-commons/lib/pagopa";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { RouteProp, useRoute } from "@react-navigation/native";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View
} from "react-native";
import BaseScreenComponent from "../../../../components/screens/BaseScreenComponent";
import { navigateToPaymentTransactionSummaryScreen } from "../../../../store/actions/navigation";
import themeVariables from "../../../../theme/variables";
import { emptyContextualHelp } from "../../../../utils/emptyContextualHelp";
import {
  decodeOrganizationFiscalCode,
  validateOrganizationFiscalCode
} from "../../common/utils/validation";
import { WalletPaymentParamsList } from "../navigation/params";

export type WalletPaymentInputFiscalCodeScreenRouteParams = {
  paymentNoticeNumber: O.Option<PaymentNoticeNumberFromString>;
};

type WalletPaymentInputFiscalCodeRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_INPUT_FISCAL_CODE"
>;

type InputState = {
  fiscalCodeText: string;
  fiscalCode: O.Option<OrganizationFiscalCode>;
};

const WalletPaymentInputFiscalCodeScreen = () => {
  const { params } = useRoute<WalletPaymentInputFiscalCodeRouteProps>();
  const [inputState, setInputState] = React.useState<InputState>({
    fiscalCodeText: "",
    fiscalCode: O.none
  });

  const navigateToTransactionSummary = () => {
    pipe(
      sequenceS(O.Monad)({
        paymentNoticeNumber: params.paymentNoticeNumber,
        organizationFiscalCode: inputState.fiscalCode
      }),
      O.chain(args => O.fromEither(RptId.decode(args))),
      O.map(rptId => {
        // Set the initial amount to a fixed value (1) because it is not used, waiting to be removed from the API
        const initialAmount = "1" as AmountInEuroCents;
        navigateToPaymentTransactionSummaryScreen({
          rptId,
          initialAmount,
          paymentStartOrigin: "manual_insertion"
        });
      })
    );
  };

  return (
    <BaseScreenComponent goBack={true} contextualHelp={emptyContextualHelp}>
      <SafeAreaView style={IOStyles.flex}>
        <View style={{ flex: 1, flexGrow: 1 }}>
          <ContentWrapper>
            <H2>Inserisci il codice fiscale dell’Ente Creditore</H2>
            <VSpacer size={16} />
            <Body>Ha 11 cifre, lo trovi vicino al codice QR.</Body>
            <VSpacer size={16} />
            <TextInputValidation
              placeholder="Codice fiscale Ente Creditore"
              accessibilityLabel="Codice fiscale Ente Creditore"
              value={inputState.fiscalCodeText}
              icon="fiscalCodeIndividual"
              onChangeText={value =>
                setInputState({
                  fiscalCodeText: value,
                  fiscalCode: decodeOrganizationFiscalCode(value)
                })
              }
              onValidate={validateOrganizationFiscalCode}
              counterLimit={11}
              textInputProps={{
                keyboardType: "number-pad",
                inputMode: "number-pad"
                // returnKeyType: "done"
              }}
            />
          </ContentWrapper>
        </View>
        <KeyboardAvoidingView
          behavior={Platform.OS === "android" ? undefined : "padding"}
          keyboardVerticalOffset={Platform.select({
            ios: 110 + 16,
            android: themeVariables.contentPadding
          })}
        >
          <ContentWrapper>
            <ButtonSolid
              label="Continua"
              accessibilityLabel="Continua"
              onPress={navigateToTransactionSummary}
              fullWidth={true}
              disabled={O.isNone(inputState.fiscalCode)}
            />
            <VSpacer size={16} />
          </ContentWrapper>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BaseScreenComponent>
  );
};

export { WalletPaymentInputFiscalCodeScreen };
