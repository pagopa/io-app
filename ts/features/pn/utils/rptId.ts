import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { sequenceS } from "fp-ts/lib/Apply";
import { NotificationPaymentInfo } from "../store/types/types";
import { PaymentNoticeNumber } from "../../../../definitions/backend/PaymentNoticeNumber";
import { OrganizationFiscalCode } from "../../../../definitions/backend/OrganizationFiscalCode";
import { getRptIdFromNoticeNumber } from "../../../utils/payment";

const getRptIdFromPayment = (payment: NotificationPaymentInfo | undefined) =>
  pipe(
    payment,
    O.fromNullable,
    O.chain(({ noticeCode, creditorTaxId }) =>
      pipe(
        sequenceS(E.Apply)({
          organizationFiscalCode: OrganizationFiscalCode.decode(creditorTaxId),
          noticeNumber: PaymentNoticeNumber.decode(noticeCode)
        }),
        O.fromEither,
        O.chain(({ organizationFiscalCode, noticeNumber }) =>
          getRptIdFromNoticeNumber(organizationFiscalCode, noticeNumber)
        )
      )
    ),
    O.toUndefined
  );

export { getRptIdFromPayment };
