import { format } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { RefundDetailDTO } from "../../../../../../definitions/idpay/RefundDetailDTO";

const getRefundPeriodDateString = (refund: RefundDetailDTO) =>
  pipe(
    sequenceS(O.Monad)({
      startDate: pipe(
        refund.startDate,
        O.fromNullable,
        O.map(date => format(date, "DD/MM/YY"))
      ),
      endDate: pipe(
        refund.endDate,
        O.fromNullable,
        O.map(date => format(date, "DD/MM/YY"))
      )
    }),
    O.map(({ startDate, endDate }) => `${startDate} - ${endDate}`),
    O.getOrElse(() => "-")
  );

export { getRefundPeriodDateString };
