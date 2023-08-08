import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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

const mapFailureScreenProps: Partial<
  Record<PaymentFailure, OperationResultScreenContent>
> = {
  [PaymentFailureEnum.GENERIC]: {
    pictogram: "umbrella", // FIXME: add correct pictogram (IOBP-176)
    title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
    subtitle: I18n.t("idpay.payment.result.failure.GENERIC.body")
  },
  [PaymentFailureEnum.REJECTED]: {
    pictogram: "error", // FIXME: add correct pictogram (IOBP-176)
    title: I18n.t("idpay.payment.result.failure.REJECTED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.REJECTED.body")
  },
  [PaymentFailureEnum.EXPIRED]: {
    pictogram: "timeout", // FIXME: add correct pictogram (IOBP-176)
    title: I18n.t("idpay.payment.result.failure.EXPIRED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.EXPIRED.body")
  },
  [PaymentFailureEnum.BUDGET_EXHAUSTED]: {
    pictogram: "error", // FIXME: add correct pictogram (IOBP-176)
    title: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.title"),
    subtitle: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.body")
  },
  [PaymentFailureEnum.AUTHORIZED]: {
    pictogram: "completed", // FIXME: add correct pictogram (IOBP-176)
    title: I18n.t("idpay.payment.result.failure.AUTHORIZED.title")
  }
};

const IDPayPaymentResultScreen = () => {
  const machine = usePaymentMachineService();

  const failureOption = useSelector(machine, selectFailureOption);
  const isCancelled = useSelector(machine, selectIsCancelled);
  const isFailure = useSelector(machine, selectIsFailure);

  const failureProps = pipe(
    failureOption,
    O.alt(() => O.some(PaymentFailureEnum.GENERIC)),
    O.chain(f => O.fromNullable(mapFailureScreenProps[f]))
  );

  const closeAction: OperationResultScreenContent["action"] = {
    label: I18n.t("global.buttons.close"),
    accessibilityLabel: I18n.t("global.buttons.close"),
    onPress: () => machine.send("EXIT")
  };

  if (isFailure && O.isSome(failureProps)) {
    return (
      <OperationResultScreenContent
        {...failureProps.value}
        action={closeAction}
        testID="paymentFailureScreenTestID"
      />
    );
  }

  if (isCancelled) {
    return (
      <OperationResultScreenContent
        pictogram="unrecognized" // FIXME: add correct pictogram (IOBP-176)
        title={I18n.t("idpay.payment.result.cancelled.title")}
        action={closeAction}
        testID="paymentCancelledScreenTestID"
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="completed" // FIXME: add correct pictogram (IOBP-176)
      title={I18n.t("idpay.payment.result.success.title")}
      subtitle={I18n.t("idpay.payment.result.success.body")}
      action={closeAction}
      testID="paymentSuccessScreenTestID"
    />
  );
};

export { IDPayPaymentResultScreen };
