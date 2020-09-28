import * as React from "react";
import { SafeAreaView } from "react-native";
import { H1 } from "../../../../../components/core/typography/H1";

/**
 * This screen allows the user to activate bpd on the payment methods already in the wallet
 */
export const EnrollPaymentMethodsScreen: React.FunctionComponent = () => (
  <SafeAreaView>
    <H1>Aggiungi metodo di pagamento</H1>
  </SafeAreaView>
);
