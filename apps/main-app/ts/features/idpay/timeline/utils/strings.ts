import { RefundDetailDTO } from "@io-app/api-types/generated/definitions/idpay/RefundDetailDTO";
import { format } from "date-fns";

const getRefundPeriodDateString = (refund: RefundDetailDTO) =>
  refund.startDate && refund.endDate
    ? `${format(refund.startDate, "DD/MM/YY")} - ${format(refund.endDate, "DD/MM/YY")}`
    : "-";

export { getRefundPeriodDateString };
