import * as O from "fp-ts/lib/Option";
import { useMemo, default as React } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { IdPayPaymentMachineContext } from "../machine/provider";
import { failureSelector, isCancelledSelector } from "../machine/selectors";
import { PaymentFailureEnum } from "../types/PaymentFailure";

const IDPayPaymentResultScreen = () => {
  const { useActorRef, useSelector } = IdPayPaymentMachineContext;
  const machine = useActorRef();

  const failureOption = useSelector(failureSelector);
  const isCancelled = useSelector(isCancelledSelector);

  const defaultCloseAction = useMemo(
    () => ({
      label: I18n.t("global.buttons.close"),
      accessibilityLabel: I18n.t("global.buttons.close"),
      onPress: () => machine.send({ type: "close" })
    }),
    [machine]
  );

  if (O.isSome(failureOption)) {
    return (
      <OperationResultScreenContent
        {...mapFailureToContentProps(failureOption.value)}
        action={defaultCloseAction}
        testID="paymentFailureScreenTestID"
      />
    );
  }

  if (isCancelled) {
    return (
      <OperationResultScreenContent
        pictogram="trash"
        title={I18n.t("idpay.payment.result.cancelled.title")}
        action={defaultCloseAction}
        testID="paymentCancelledScreenTestID"
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("idpay.payment.result.success.title")}
      subtitle={I18n.t("idpay.payment.result.success.body")}
      action={defaultCloseAction}
      testID="paymentSuccessScreenTestID"
    />
  );
};

const genericErrorProps: OperationResultScreenContentProps = {
  pictogram: "umbrellaNew",
  title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
  subtitle: I18n.t("idpay.payment.result.failure.GENERIC.subtitle")
};

const mapFailureToContentProps = (
  failure: PaymentFailureEnum
): OperationResultScreenContentProps => {
  switch (failure) {
    case PaymentFailureEnum.TRANSACTION_EXPIRED:
      return {
        pictogram: "timing",
        title: I18n.t("idpay.payment.result.failure.TRANSACTION_EXPIRED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.TRANSACTION_EXPIRED.subtitle"
        )
      };
    case PaymentFailureEnum.USER_SUSPENDED:
      return {
        pictogram: "attention",
        title: I18n.t("idpay.payment.result.failure.USER_SUSPENDED.title"),
        subtitle: I18n.t("idpay.payment.result.failure.USER_SUSPENDED.subtitle")
      };
    case PaymentFailureEnum.USER_NOT_ONBOARDED:
      return {
        pictogram: "accessDenied",
        title: I18n.t("idpay.payment.result.failure.USER_NOT_ONBOARDED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.USER_NOT_ONBOARDED.subtitle"
        )
      };
    case PaymentFailureEnum.USER_UNSUBSCRIBED:
      return {
        pictogram: "accessDenied",
        title: I18n.t("idpay.payment.result.failure.USER_UNSUBSCRIBED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.USER_UNSUBSCRIBED.subtitle"
        )
      };
    case PaymentFailureEnum.ALREADY_AUTHORIZED:
      return {
        pictogram: "success",
        title: I18n.t("idpay.payment.result.failure.ALREADY_AUTHORIZED.title")
      };
    case PaymentFailureEnum.BUDGET_EXHAUSTED:
      return {
        pictogram: "fatalError",
        title: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.BUDGET_EXHAUSTED.subtitle"
        )
      };
    case PaymentFailureEnum.ALREADY_ASSIGNED:
      return {
        pictogram: "fatalError",
        title: I18n.t("idpay.payment.result.failure.ALREADY_ASSIGNED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.ALREADY_ASSIGNED.subtitle"
        )
      };
    case PaymentFailureEnum.INVALID_DATE:
      return {
        pictogram: "time",
        title: I18n.t("idpay.payment.result.failure.INVALID_DATE.title"),
        subtitle: I18n.t("idpay.payment.result.failure.INVALID_DATE.subtitle")
      };
    default:
      return genericErrorProps;
  }
};

export { IDPayPaymentResultScreen };
