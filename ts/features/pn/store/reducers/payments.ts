import { pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as RA from "fp-ts/lib/ReadonlyArray";
import * as O from "fp-ts/lib/Option";
import { UIMessageId } from "../../../messages/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  isError,
  isReady,
  RemoteValue
} from "../../../../common/model/RemoteValue";
import { Detail_v2Enum } from "../../../../../definitions/backend/PaymentProblemJson";
import { PaymentRequestsGetResponse } from "../../../../../definitions/backend/PaymentRequestsGetResponse";
import { NotificationPaymentInfo } from "../../../../../definitions/pn/NotificationPaymentInfo";
import { getRptIdStringFromPayment } from "../../../pn/utils/rptId";
import { SinglePaymentState } from "../../../messages/store/reducers/payments";

export const paymentsButtonStateSelector = (
  state: GlobalState,
  messageId: UIMessageId,
  payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
  maxVisiblePaymentCount: number
) =>
  pipe(
    state.entities.messages.payments[messageId],
    O.fromNullable,
    computeUpdatedPaymentCount(payments, maxVisiblePaymentCount),
    buttonStateFromUpdatedPaymentCount(payments, maxVisiblePaymentCount)
  );

const computeUpdatedPaymentCount =
  (
    payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
    maxVisiblePaymentCount: number
  ) =>
  (maybePaymentStatuses: O.Option<SinglePaymentState>) =>
    pipe(
      maybePaymentStatuses,
      O.map(paymentStatuses =>
        pipe(
          payments ?? [],
          RA.takeLeft(maxVisiblePaymentCount),
          RA.reduce(initialPaymentStatistics(), (accumulator, payment) =>
            pipe(
              payment,
              getRptIdStringFromPayment,
              paymentId => paymentStatuses[paymentId],
              O.fromNullable,
              computePaymentStatistics(accumulator)
            )
          )
        )
      ),
      O.getOrElse(() => initialPaymentStatistics())
    );

type PaymentStatistics = {
  updatedPaymentCount: number;
  errorPaymentCount: number;
};

const initialPaymentStatistics: () => PaymentStatistics = () => ({
  updatedPaymentCount: 0,
  errorPaymentCount: 0
});

const updatedPaymentStatistics = (previousStatistics: PaymentStatistics) => ({
  updatedPaymentCount: previousStatistics.updatedPaymentCount + 1,
  errorPaymentCount: previousStatistics.errorPaymentCount
});
const errorPaymentStatistics = (previousStatistics: PaymentStatistics) => ({
  updatedPaymentCount: previousStatistics.updatedPaymentCount + 1,
  errorPaymentCount: previousStatistics.errorPaymentCount + 1
});

const computePaymentStatistics =
  (previousStatistics: PaymentStatistics) =>
  (
    maybePaymentStatus: O.Option<
      RemoteValue<PaymentRequestsGetResponse, Detail_v2Enum>
    >
  ) =>
    pipe(
      maybePaymentStatus,
      O.map(paymentStatus =>
        pipe(
          isError(paymentStatus),
          B.fold(
            () =>
              pipe(
                isReady(paymentStatus),
                B.fold(
                  () => ({ ...previousStatistics }),
                  () => updatedPaymentStatistics(previousStatistics)
                )
              ),
            () => errorPaymentStatistics(previousStatistics)
          )
        )
      ),
      O.getOrElse(() => ({ ...previousStatistics }))
    );

const buttonStateFromUpdatedPaymentCount =
  (
    payments: ReadonlyArray<NotificationPaymentInfo> | undefined,
    maxVisiblePaymentCount: number
  ) =>
  (updatedPaymentStatistics: PaymentStatistics) =>
    pipe(payments?.length ?? 0, paymentCount =>
      pipe(
        paymentCount <= maxVisiblePaymentCount &&
          paymentCount === updatedPaymentStatistics.errorPaymentCount,
        B.fold(
          () =>
            pipe(
              updatedPaymentStatistics.updatedPaymentCount > 0,
              B.fold(
                () => "visibleLoading" as const,
                () => "visibleEnabled" as const
              )
            ),
          () => "hidden" as const
        )
      )
    );
