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

const IDPayPaymentResultScreen = () => {
  const machine = usePaymentMachineService();

  const failureOption = useSelector(machine, selectFailureOption);

  const handleClose = () => {
    machine.send("EXIT");
  };

  const content = pipe(
    failureOption,
    O.fold(
      () => <SuccessScreenComponent />,
      failure => <FailureScreenComponent failure={failure} />
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

const SuccessScreenComponent = () => (
  <View style={styles.resultScreenContainer}>
    <Pictogram name={"completed"} size={120} />
    <VSpacer size={24} />
    <NewH4 style={styles.justifyTextCenter}>
      {I18n.t("idpay.payment.result.success.title")}
    </NewH4>
    <VSpacer size={16} />
    <Body style={styles.justifyTextCenter}>
      {I18n.t("idpay.payment.result.success.body")}
    </Body>
  </View>
);

type FailureScreenContent = {
  title: string;
  subtitle?: string;
  icon: IOPictograms;
};

const genericErrorContent: FailureScreenContent = {
  title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
  subtitle: I18n.t("idpay.payment.result.failure.GENERIC.body"),
  icon: "umbrella"
};

const failureScreenContent: Partial<
  Record<PaymentFailure, FailureScreenContent>
> = {
  [PaymentFailureEnum.GENERIC]: genericErrorContent,
  [PaymentFailureEnum.CANCELLED]: {
    title: I18n.t("idpay.payment.result.failure.CANCELLED.title"),
    icon: "unrecognized"
  },
  [PaymentFailureEnum.REJECTED]: {
    title: I18n.t("idpay.payment.result.failure.REJECTED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.REJECTED.body"),
    icon: "error"
  },
  [PaymentFailureEnum.EXPIRED]: {
    title: I18n.t("idpay.payment.result.failure.EXPIRED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.EXPIRED.body"),
    icon: "timeout"
  },
  [PaymentFailureEnum.BUDGET_EXHAUSTED]: {
    title: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.body"),
    icon: "error"
  }
};

type FailureScreenComponentProps = {
  failure: PaymentFailure;
};

const FailureScreenComponent = (props: FailureScreenComponentProps) => {
  const { failure } = props;

  const content: FailureScreenContent = pipe(
    failureScreenContent[failure],
    O.fromNullable,
    O.getOrElse(() => genericErrorContent)
  );

  return (
    <View style={styles.resultScreenContainer}>
      <Pictogram name={content.icon} size={120} />
      <VSpacer size={24} />
      <NewH4 style={styles.justifyTextCenter}>{content.title}</NewH4>
      {content.subtitle && (
        <>
          <VSpacer size={16} />
          <Body style={styles.justifyTextCenter}>{content.subtitle}</Body>
        </>
      )}
    </View>
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
