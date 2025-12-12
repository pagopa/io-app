import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { useMemo } from "react";
import {
  OperationResultScreenContent,
  OperationResultScreenContentProps
} from "../../../../components/screens/OperationResultScreenContent";
import { useIOSelector } from "../../../../store/hooks";
import useIDPayFailureSupportModal from "../../common/hooks/useIDPayFailureSupportModal";
import { idpayInitiativeDetailsSelector } from "../../details/store";
import { IdPayPaymentMachineContext } from "../machine/provider";
import {
  dataEntrySelector,
  failureSelector,
  isCancelledSelector
} from "../machine/selectors";
import { PaymentFailureEnum } from "../types/PaymentFailure";
import {
  trackIDPayDetailAuthorizationError,
  trackIDPayDetailAuthorizationUXSuccess
} from "../../details/analytics";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";

const IDPayPaymentResultScreen = () => {
  const { useActorRef, useSelector } = IdPayPaymentMachineContext;
  const machine = useActorRef();

  const failureOption = useSelector(failureSelector);
  const isCancelled = useSelector(isCancelledSelector);
  const data_entry = useSelector(dataEntrySelector);

  const isGenericPaymentError = pipe(
    failureOption,
    O.map(failure => failure === PaymentFailureEnum.PAYMENT_GENERIC_ERROR),
    O.getOrElse(() => false)
  );

  const initiativeDataPot = useIOSelector(idpayInitiativeDetailsSelector);
  const initiative = pipe(
    initiativeDataPot,
    pot.toOption,
    O.map(details => ({
      initiativeId: details.initiativeId,
      serviceId: details.serviceId,
      initiativeName: details.initiativeName
    })),
    O.toUndefined
  );

  const { bottomSheet, present } = useIDPayFailureSupportModal(
    initiative?.serviceId ?? "",
    initiative?.initiativeId
  );

  const defaultCloseAction = useMemo(
    () => ({
      label: isGenericPaymentError
        ? I18n.t("global.buttons.back")
        : I18n.t("global.buttons.close"),
      onPress: () => machine.send({ type: "close" })
    }),
    [isGenericPaymentError, machine]
  );

  const secondaryAction = useMemo(
    () => ({
      label: I18n.t("idpay.support.supportTitle"),
      onPress: () => present(PaymentFailureEnum.PAYMENT_GENERIC_ERROR)
    }),
    [present]
  );

  useOnFirstRender(() => {
    if (!isCancelled && !O.isSome(failureOption)) {
      trackIDPayDetailAuthorizationUXSuccess({
        initiativeName: initiative?.initiativeName,
        initiativeId: initiative?.initiativeId,
        data_entry
      });
    }
    if (O.isSome(failureOption)) {
      trackIDPayDetailAuthorizationError({
        initiativeName: initiative?.initiativeName,
        initiativeId: initiative?.initiativeId,
        data_entry,
        reason: failureOption.value
      });
    }
  });

  if (O.isSome(failureOption)) {
    return (
      <>
        <OperationResultScreenContent
          action={defaultCloseAction}
          secondaryAction={isGenericPaymentError ? secondaryAction : undefined}
          {...mapFailureToContentProps(failureOption.value)}
          testID="paymentFailureScreenTestID"
        />
        {bottomSheet}
      </>
    );
  }

  if (isCancelled) {
    return (
      <OperationResultScreenContent
        pictogram="trash"
        title={I18n.t("idpay.payment.result.cancelled.title")}
        subtitle={I18n.t("idpay.payment.result.cancelled.subtitle")}
        action={defaultCloseAction}
        testID="paymentCancelledScreenTestID"
      />
    );
  }

  return (
    <OperationResultScreenContent
      pictogram="success"
      title={I18n.t("idpay.payment.result.success.title")}
      action={defaultCloseAction}
      testID="paymentSuccessScreenTestID"
      enableAnimatedPictogram
      loop={false}
    />
  );
};

const genericErrorProps: OperationResultScreenContentProps = {
  pictogram: "accessDenied",
  title: I18n.t("idpay.payment.result.failure.GENERIC.title"),
  subtitle: I18n.t("idpay.payment.result.failure.GENERIC.subtitle")
};

const mapFailureToContentProps = (
  failure: PaymentFailureEnum
): OperationResultScreenContentProps => {
  switch (failure) {
    case PaymentFailureEnum.PAYMENT_TRANSACTION_EXPIRED:
      return {
        pictogram: "timing",
        title: I18n.t("idpay.payment.result.failure.TRANSACTION_EXPIRED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.TRANSACTION_EXPIRED.subtitle"
        )
      };
    case PaymentFailureEnum.PAYMENT_USER_SUSPENDED:
      return {
        pictogram: "attention",
        title: I18n.t("idpay.payment.result.failure.USER_SUSPENDED.title"),
        subtitle: I18n.t("idpay.payment.result.failure.USER_SUSPENDED.subtitle")
      };
    case PaymentFailureEnum.PAYMENT_USER_NOT_ONBOARDED:
      return {
        pictogram: "accessDenied",
        title: I18n.t("idpay.payment.result.failure.USER_NOT_ONBOARDED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.USER_NOT_ONBOARDED.subtitle"
        )
      };
    case PaymentFailureEnum.PAYMENT_USER_UNSUBSCRIBED:
      return {
        pictogram: "accessDenied",
        title: I18n.t("idpay.payment.result.failure.USER_UNSUBSCRIBED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.USER_UNSUBSCRIBED.subtitle"
        )
      };
    case PaymentFailureEnum.PAYMENT_ALREADY_AUTHORIZED:
      return {
        pictogram: "success",
        title: I18n.t("idpay.payment.result.failure.ALREADY_AUTHORIZED.title")
      };
    case PaymentFailureEnum.PAYMENT_BUDGET_EXHAUSTED:
      return {
        pictogram: "fatalError",
        title: I18n.t("idpay.payment.result.failure.BUDGET_EXHAUSTED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.BUDGET_EXHAUSTED.subtitle"
        )
      };
    case PaymentFailureEnum.PAYMENT_ALREADY_ASSIGNED:
      return {
        pictogram: "fatalError",
        title: I18n.t("idpay.payment.result.failure.ALREADY_ASSIGNED.title"),
        subtitle: I18n.t(
          "idpay.payment.result.failure.ALREADY_ASSIGNED.subtitle"
        )
      };
    case PaymentFailureEnum.PAYMENT_INITIATIVE_INVALID_DATE:
      return {
        pictogram: "time",
        title: I18n.t("idpay.payment.result.failure.INVALID_DATE.title"),
        subtitle: I18n.t("idpay.payment.result.failure.INVALID_DATE.subtitle")
      };
    case PaymentFailureEnum.PAYMENT_GENERIC_ERROR:
      return {
        pictogram: "umbrella",
        title: I18n.t(
          "idpay.onboarding.failure.message.PAYMENT_GENERIC_ERROR.title"
        ),
        subtitle: I18n.t(
          "idpay.onboarding.failure.message.PAYMENT_GENERIC_ERROR.subtitle"
        )
      };
    default:
      return genericErrorProps;
  }
};

export { IDPayPaymentResultScreen };
