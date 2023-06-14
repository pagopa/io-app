import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { default as React } from "react";
import { SafeAreaView, StyleSheet, View } from "react-native";
import {
  IOPictograms,
  Pictogram
} from "../../../../components/core/pictograms";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { Body } from "../../../../components/core/typography/Body";
import { NewH4 } from "../../../../components/core/typography/NewH4";
import { IOStyles } from "../../../../components/core/variables/IOStyles";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { PaymentFailure, PaymentFailureEnum } from "../xstate/failure";
import { usePaymentMachineService } from "../xstate/provider";
import { selectFailureOption } from "../xstate/selectors";

type FailureContent = {
  title: string;
  subtitle?: string;
  icon: IOPictograms;
};
type PaymentResultType = PaymentFailure | "SUCCESS";
const results: Record<PaymentResultType, FailureContent> = {
  [PaymentFailureEnum.CANCELLED]: {
    title: I18n.t("idpay.payment.result.failure.CANCELLED.title"),
    icon: "unrecognized"
  },
  [PaymentFailureEnum.GENERIC]: {
    title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
    subtitle: I18n.t("idpay.payment.result.failure.GENERIC.body"),
    icon: "umbrella"
  },
  ["SUCCESS"]: {
    title: I18n.t("idpay.payment.result.success.title"),
    subtitle: I18n.t("idpay.payment.result.success.body"),
    icon: "completed"
  }
};

const IDPayPaymentResultScreen = () => {
  const machine = usePaymentMachineService();
  const failureOption = useSelector(machine, selectFailureOption);

  const handleClose = () => {
    machine.send("EXIT");
  };

  const renderContent = (resultType: PaymentResultType) => (
    <View style={styles.resultScreenContainer}>
      <Pictogram name={results[resultType].icon} size={120} />
      <VSpacer size={24} />
      <NewH4 style={styles.justifyTextCenter}>
        {results[resultType].title}
      </NewH4>
      <VSpacer size={16} />
      {results[resultType].subtitle && (
        <Body style={styles.justifyTextCenter}>
          {results[resultType].subtitle}
        </Body>
      )}
    </View>
  );

  const content = pipe(
    failureOption,
    O.fold(
      () => renderContent("SUCCESS"),
      failure => renderContent(failure)
    )
  );

  return (
    <SafeAreaView style={IOStyles.flex}>
      {content}
      <FooterWithButtons
        type="SingleButton"
        leftButton={{
          title: "Chiudi",
          bordered: true,
          onPress: handleClose
        }}
      />
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  resultScreenContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 48
  },
  justifyTextCenter: {
    textAlign: "center"
  }
});

export { IDPayPaymentResultScreen };
