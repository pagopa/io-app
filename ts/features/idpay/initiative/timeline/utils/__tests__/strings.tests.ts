import {
  OperationTypeEnum,
  RefundDetailDTO
} from "../../../../../../../definitions/idpay/RefundDetailDTO";
import { getRefundPeriodDateString } from "../strings";

const T_REFUND: RefundDetailDTO = {
  amount: 100,
  eventId: "ABC",
  operationDate: new Date(),
  operationId: "ABC",
  operationType: OperationTypeEnum.PAID_REFUND,
  startDate: new Date(2023, 8, 21),
  endDate: new Date(2023, 9, 21)
};

describe("getRefundPeriodDateString", () => {
  it("should return correct date string", () => {
    const tString = "21/09/23 - 21/10/23";
    const resultString = getRefundPeriodDateString(T_REFUND);
    expect(resultString).toStrictEqual(tString);
  });

  it("should return '-' if start date and/or end date are undefined", () => {
    const tString = "-";
    const resultString = getRefundPeriodDateString({
      ...T_REFUND,
      endDate: undefined
    });
    expect(resultString).toStrictEqual(tString);
  });
});
