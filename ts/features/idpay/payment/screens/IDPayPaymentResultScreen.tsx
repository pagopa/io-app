import { useSelector } from "@xstate/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { default as React } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import I18n from "../../../../i18n";
import { PaymentFailureEnum } from "../types/PaymentFailure";
import { usePaymentMachineService } from "../xstate/provider";
import {
  selectFailureOption,
  selectIsCancelled,
  selectIsFailure
} from "../xstate/selectors";

const IDPayPaymentResultScreen = () => {
  const machine = usePaymentMachineService();

  const failureOption = useSelector(machine, selectFailureOption);
  const isCancelled = useSelector(machine, selectIsCancelled);
  const isFailure = useSelector(machine, selectIsFailure);

  const defaultCloseAction = React.useMemo(
    () => ({
      label: "Chiudi",
      accessibilityLabel: "Chiudi",
      onPress: () => machine.send({ type: "EXIT" })
    }),
    [machine]
  );

  if (isFailure) {
    const failureContentProps = pipe(
      failureOption,
      O.map(mapFailureToContentProps),
      O.getOrElse(() => genericErrorProps)
    );

    return (
      <OperationResultScreenContent
        {...failureContentProps}
        action={defaultCloseAction}
        testID="paymentFailureScreenTestID"
      />
    );
  }

  if (isCancelled) {
    return (
      <OperationResultScreenContent
        pictogram="unrecognized" // FIXME: add correct pictogram (IOBP-176)
        title={I18n.t("idpay.payment.result.cancelled.title")}
        action={defaultCloseAction}
        testID="paymentCancelledScreenTestID"
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="completed" // FIXME: add correct pictogram (IOBP-176)
      title={I18n.t("idpay.payment.result.success.title")}
      subtitle={I18n.t("idpay.payment.result.success.body")}
      action={defaultCloseAction}
      testID="paymentSuccessScreenTestID"
    />
  );
};

const genericErrorProps: OperationResultScreenContentProps = {
  pictogram: "umbrellaNew",
  title: "Si è verificato un errore imprevisto",
  subtitle:
    "Siamo già a lavoro per risolverlo: ti invitiamo a riprovare più tardi."
};

const mapFailureToContentProps = (
  failure: PaymentFailureEnum
): OperationResultScreenContentProps => {
  switch (failure) {
    default:
      return genericErrorProps;
  }
};

export { IDPayPaymentResultScreen };
