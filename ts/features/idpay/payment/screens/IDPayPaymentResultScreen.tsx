import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { default as React } from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { PaymentFailure, PaymentFailureEnum } from "../xstate/failure";
import { usePaymentMachineService } from "../xstate/provider";
import {
  selectFailureOption,
  selectIsCancelled,
  selectIsFailure
} from "../xstate/selectors";

/**
 * FIXME: this list is not definitive.
 * The final list will be available with IOBP-176
 */
const mapFailureScreenProps: Record<
  PaymentFailure,
  OperationResultScreenContent
> = {
  [PaymentFailureEnum.GENERIC]: {
    pictogram: "umbrella",
    title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
    subtitle: I18n.t("idpay.payment.result.failure.GENERIC.body")
  },
  [PaymentFailureEnum.REJECTED]: {
    pictogram: "error",
    title: I18n.t("idpay.payment.result.failure.REJECTED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.REJECTED.body")
  },
  [PaymentFailureEnum.EXPIRED]: {
    pictogram: "timeout",
    title: I18n.t("idpay.payment.result.failure.EXPIRED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.EXPIRED.body")
  },
  [PaymentFailureEnum.BUDGET_EXHAUSTED]: {
    pictogram: "error",
    title: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.body")
  },
  [PaymentFailureEnum.AUTHORIZED]: {
    pictogram: "completed",
    title: I18n.t("idpay.payment.result.failure.AUTHORIZED.title")
  },
  [PaymentFailureEnum.TOO_MANY_REQUESTS]: {
    pictogram: "umbrella",
    title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
    subtitle: I18n.t("idpay.payment.result.failure.GENERIC.body")
  }
};

const IDPayPaymentResultScreen = () => {
  const machine = usePaymentMachineService();

  const failureOption = useSelector(machine, selectFailureOption);
  const isCancelled = useSelector(machine, selectIsCancelled);
  const isFailure = useSelector(machine, selectIsFailure);

  const closeAction: OperationResultScreenContent["action"] = {
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    onPress: () => machine.send("EXIT")
  };

  if (isFailure && O.isSome(failureOption)) {
    return (
      <OperationResultScreenContent
        {...mapFailureScreenProps[failureOption.value]}
        action={closeAction}
        testID="paymentFailureScreenTestID"
      />
    );
  }

  if (isCancelled) {
    return (
      <OperationResultScreenContent
        pictogram="unrecognized"
        title={I18n.t("idpay.payment.result.cancelled.title")}
        action={closeAction}
        testID="paymentCancelledScreenTestID"
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="completed"
      title={I18n.t("idpay.payment.result.success.title")}
      subtitle={I18n.t("idpay.payment.result.success.body")}
      action={closeAction}
      testID="paymentSuccessScreenTestID"
    />
  );
};

export { IDPayPaymentResultScreen };
