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
import { selectFailureOption, selectIsCancelled } from "../xstate/selectors";

const IDPayPaymentResultScreen = () => {
  const machine = usePaymentMachineService();

  const failureOption = useSelector(machine, selectFailureOption);
  const isCancelled = useSelector(machine, selectIsCancelled);
  const isFailure = useSelector(machine, selectIsCancelled);

  const handleClose = () => {
    machine.send("EXIT");
  };

  const renderContent = () => {
    if (isCancelled) {
      return <CancelledScreenComponent />;
    }

    if (!isFailure) {
      return <SuccessScreenComponent />;
    }

    return pipe(
      failureOption,
      O.chain(failure => O.fromNullable(failureScreenContent[failure])),
      O.alt(() => O.some(genericErrorContent)),
      O.map(props => <FailureScreenComponent key={props.title} {...props} />)
    );
  };

  return (
    <SafeAreaView style={IOStyles.flex}>
      {renderContent()}
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

const CancelledScreenComponent = () => (
  <View style={styles.resultScreenContainer}>
    <Pictogram name={"unrecognized"} size={120} />
    <VSpacer size={24} />
    <NewH4 style={styles.justifyTextCenter}>
      {I18n.t("idpay.payment.result.cancelled.title")}
    </NewH4>
  </View>
);

type FailureScreenComponentProps = {
  title: string;
  subtitle?: string;
  icon: IOPictograms;
};

const genericErrorContent: FailureScreenComponentProps = {
  title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
  subtitle: I18n.t("idpay.payment.result.failure.GENERIC.body"),
  icon: "umbrella"
};

const failureScreenContent: Partial<
  Record<PaymentFailure, FailureScreenComponentProps>
> = {
  [PaymentFailureEnum.GENERIC]: genericErrorContent,
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

const FailureScreenComponent = (props: FailureScreenComponentProps) => {
  const { title, subtitle, icon } = props;

  return (
    <View style={styles.resultScreenContainer}>
      <Pictogram name={icon} size={120} />
      <VSpacer size={24} />
      <NewH4 style={styles.justifyTextCenter}>{title}</NewH4>
      {subtitle && (
        <>
          <VSpacer size={16} />
          <Body style={styles.justifyTextCenter}>{subtitle}</Body>
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
