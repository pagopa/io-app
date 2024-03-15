import { Dispatch } from "redux";
import {
  duplicateSetAndAdd,
  duplicateSetAndRemove,
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "..";
import { PaymentData, UIMessageId } from "../../types";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { addUserSelectedPaymentRptId } from "../../store/actions";
import { paymentInitializeState } from "../../../../store/actions/wallet/payment";
import * as pnAnalytics from "../../../pn/analytics/index";
import { PaymentAmount } from "../../../../../definitions/backend/PaymentAmount";

describe("getRptIdStringFromPaymentData", () => {
  it("should properly format the RptID", () => {
    const fiscalCode = "01234567890";
    const noticeNumber = "012345678912345610";
    const paymentData = {
      noticeNumber,
      payee: {
        fiscalCode
      }
    } as PaymentData;
    const rptId = getRptIdStringFromPaymentData(paymentData);
    expect(rptId).toBe(`${fiscalCode}${noticeNumber}`);
  });
});

describe("intializeAndNavigateToWalletForPayment", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  it("should call error callback on bad rptId", () => {
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const paymentId = "badRptId";
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();
    initializeAndNavigateToWalletForPayment(
      "01HRA60BRYF6BCHF17SMXG8PP2" as UIMessageId,
      paymentId,
      false,
      undefined,
      true,
      {} as Dispatch<any>,
      false,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).toHaveBeenCalledTimes(1);
    expect(prenavigationCallback).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
  it("should call pre navigation callback on good rptId and navigate to wallet home", () => {
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const paymentId = "01234567890012345678912345610";
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();
    initializeAndNavigateToWalletForPayment(
      "01HRA60BRYF6BCHF17SMXG8PP2" as UIMessageId,
      paymentId,
      false,
      undefined,
      false,
      {} as Dispatch<any>,
      false,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params: {
        newMethodAdded: false
      }
    });
  });
  it("should navigate to Payment Transaction Summary with default 0-amount", () => {
    const analyticsSpy = jest
      .spyOn(pnAnalytics, "trackPNPaymentStart")
      .mockImplementation(() => undefined);
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const messageId = "01HRA60BRYF6BCHF17SMXG8PP2" as UIMessageId;
    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      messageId,
      paymentId,
      false,
      undefined,
      true,
      dispatch,
      false,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(2);
    expect(analyticsSpy).not.toHaveBeenCalled();
    expect(dispatch.mock.calls[0][0]).toStrictEqual(
      addUserSelectedPaymentRptId(paymentId)
    );
    expect(dispatch.mock.calls[1][0]).toStrictEqual(paymentInitializeState());
    expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params: {
        rptId: {
          organizationFiscalCode,
          paymentNoticeNumber: {
            applicationCode,
            auxDigit,
            checkDigit,
            iuv13
          }
        },
        paymentStartOrigin: "message",
        initialAmount: "0000",
        messageId
      }
    });
  });
  it("should navigate to Payment Transaction Summary with default 0-amount and no prenavigation callback", () => {
    const analyticsSpy = jest
      .spyOn(pnAnalytics, "trackPNPaymentStart")
      .mockImplementation(() => undefined);
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const messageId = "01HRA60BRYF6BCHF17SMXG8PP2" as UIMessageId;
    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      messageId,
      paymentId,
      false,
      undefined,
      true,
      dispatch,
      false,
      decodeErrorCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(dispatch.mock.calls).toHaveLength(2);
    expect(analyticsSpy).not.toHaveBeenCalled();
    expect(dispatch.mock.calls[0][0]).toStrictEqual(
      addUserSelectedPaymentRptId(paymentId)
    );
    expect(dispatch.mock.calls[1][0]).toStrictEqual(paymentInitializeState());
    expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params: {
        rptId: {
          organizationFiscalCode,
          paymentNoticeNumber: {
            applicationCode,
            auxDigit,
            checkDigit,
            iuv13
          }
        },
        paymentStartOrigin: "message",
        initialAmount: "0000",
        messageId
      }
    });
  });
  it("should navigate to Payment Transaction Summary with given amount and track PN event", () => {
    const analyticsSpy = jest
      .spyOn(pnAnalytics, "trackPNPaymentStart")
      .mockImplementation(() => undefined);
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const messageId = "01HRA60BRYF6BCHF17SMXG8PP2" as UIMessageId;
    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;
    const paymentAmount = 199 as PaymentAmount;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      messageId,
      paymentId,
      false,
      paymentAmount,
      true,
      dispatch,
      true,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(2);
    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual(
      addUserSelectedPaymentRptId(paymentId)
    );
    expect(dispatch.mock.calls[1][0]).toStrictEqual(paymentInitializeState());
    expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params: {
        rptId: {
          organizationFiscalCode,
          paymentNoticeNumber: {
            applicationCode,
            auxDigit,
            checkDigit,
            iuv13
          }
        },
        paymentStartOrigin: "message",
        initialAmount: `${paymentAmount}`,
        messageId
      }
    });
  });
  it("should navigate to Payment Transaction Summary with given amount", () => {
    const analyticsSpy = jest
      .spyOn(pnAnalytics, "trackPNPaymentStart")
      .mockImplementation(() => undefined);
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const messageId = "01HRA60BRYF6BCHF17SMXG8PP2" as UIMessageId;
    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;
    const paymentAmount = 199 as PaymentAmount;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      messageId,
      paymentId,
      false,
      paymentAmount,
      true,
      dispatch,
      false,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(2);
    expect(analyticsSpy).not.toHaveBeenCalled();
    expect(dispatch.mock.calls[0][0]).toStrictEqual(
      addUserSelectedPaymentRptId(paymentId)
    );
    expect(dispatch.mock.calls[1][0]).toStrictEqual(paymentInitializeState());
    expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params: {
        rptId: {
          organizationFiscalCode,
          paymentNoticeNumber: {
            applicationCode,
            auxDigit,
            checkDigit,
            iuv13
          }
        },
        paymentStartOrigin: "message",
        initialAmount: `${paymentAmount}`,
        messageId
      }
    });
  });
  it("should navigate to Payment Transaction Summary with given amount but not dispatch an `addUserSelectedPaymentRptId`", () => {
    const analyticsSpy = jest
      .spyOn(pnAnalytics, "trackPNPaymentStart")
      .mockImplementation(() => undefined);
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const messageId = "01HRA60BRYF6BCHF17SMXG8PP2" as UIMessageId;
    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;
    const paymentAmount = 199 as PaymentAmount;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      messageId,
      paymentId,
      true,
      paymentAmount,
      true,
      dispatch,
      false,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(1);
    expect(analyticsSpy).not.toHaveBeenCalled();
    expect(dispatch.mock.calls[0][0]).toStrictEqual(paymentInitializeState());
    expect(navigateSpy).toHaveBeenCalledWith(ROUTES.WALLET_NAVIGATOR, {
      screen: ROUTES.PAYMENT_TRANSACTION_SUMMARY,
      params: {
        rptId: {
          organizationFiscalCode,
          paymentNoticeNumber: {
            applicationCode,
            auxDigit,
            checkDigit,
            iuv13
          }
        },
        paymentStartOrigin: "message",
        initialAmount: `${paymentAmount}`,
        messageId
      }
    });
  });
});

describe("duplicateSetAndAdd", () => {
  it("should duplicate input set and add new item", () => {
    const inputSet = new Set<string>();
    const newItem = "newItem";
    const outputSet = duplicateSetAndAdd(inputSet, newItem);
    expect(inputSet).not.toBe(outputSet);
    expect(inputSet.size).toBe(outputSet.size - 1);
    expect(inputSet.has(newItem)).toBe(false);
    expect(outputSet.has(newItem)).toBe(true);
  });
  it("should duplicate input set but not add an existing item", () => {
    const inputSet = new Set<string>();
    const existingItem = "existingItem";
    inputSet.add(existingItem);
    const duplicatedItem = "existingItem";
    const outputSet = duplicateSetAndAdd(inputSet, duplicatedItem);
    expect(inputSet).not.toBe(outputSet);
    expect(inputSet.size).toBe(outputSet.size);
    expect(inputSet.has(existingItem)).toBe(true);
    expect(outputSet.has(existingItem)).toBe(true);
    expect(inputSet.has(duplicatedItem)).toBe(true);
    expect(outputSet.has(duplicatedItem)).toBe(true);
  });
});

describe("duplicateSetAndRemove", () => {
  it("should duplicate input set and remove existing item", () => {
    const inputSet = new Set<string>();
    const existingItem = "newItem";
    inputSet.add(existingItem);
    const outputSet = duplicateSetAndRemove(inputSet, existingItem);
    expect(inputSet).not.toBe(outputSet);
    expect(inputSet.size).toBe(outputSet.size + 1);
    expect(inputSet.has(existingItem)).toBe(true);
    expect(outputSet.has(existingItem)).toBe(false);
  });
  it("should duplicate input set and do nothing it the item does not exist", () => {
    const inputSet = new Set<string>();
    const existingItem = "existingItem";
    inputSet.add(existingItem);
    const unmatchingItem = "unmathingItem";
    const outputSet = duplicateSetAndRemove(inputSet, unmatchingItem);
    expect(inputSet).not.toBe(outputSet);
    expect(inputSet.size).toBe(outputSet.size);
    expect(inputSet.has(existingItem)).toBe(true);
    expect(outputSet.has(existingItem)).toBe(true);
    expect(inputSet.has(unmatchingItem)).toBe(false);
    expect(outputSet.has(unmatchingItem)).toBe(false);
  });
});
