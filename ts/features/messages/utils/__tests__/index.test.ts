import { Dispatch } from "redux";
import {
  duplicateSetAndAdd,
  duplicateSetAndRemove,
  emptyMessageArray,
  extractContentFromMessageSources,
  getRptIdStringFromPaymentData,
  initializeAndNavigateToWalletForPayment
} from "..";
import { PaymentData, UIMessageDetails } from "../../types";
import NavigationService from "../../../../navigation/NavigationService";
import ROUTES from "../../../../navigation/routes";
import { addUserSelectedPaymentRptId } from "../../store/actions";
import { startPaymentFlowWithRptIdWorkaround } from "../../../payments/checkout/tempWorkaround/pagoPaPaymentWorkaround";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { ThirdPartyMessage } from "../../../../../definitions/backend/ThirdPartyMessage";

jest.mock(
  "../../../payments/checkout/tempWorkaround/pagoPaPaymentWorkaround",
  () => ({
    startPaymentFlowWithRptIdWorkaround: jest.fn()
  })
);

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
    const analyticsCallback = jest.fn();
    initializeAndNavigateToWalletForPayment(
      paymentId,
      true,
      true,
      {} as Dispatch<any>,
      analyticsCallback,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).toHaveBeenCalledTimes(1);
    expect(prenavigationCallback).not.toHaveBeenCalled();
    expect(analyticsCallback).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
  it("should call pre navigation callback on good rptId and navigate to wallet home", () => {
    const navigateSpy = jest.spyOn(NavigationService, "navigate");
    const paymentId = "01234567890012345678912345610";
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();
    const analyticsCallback = jest.fn();
    initializeAndNavigateToWalletForPayment(
      paymentId,
      true,
      false,
      {} as Dispatch<any>,
      analyticsCallback,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(analyticsCallback).not.toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: ROUTES.WALLET_HOME,
      params: {
        newMethodAdded: false
      }
    });
  });
  it("should navigate to Payment Transaction Summary with default 0-amount", () => {
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();
    const analyticsCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      paymentId,
      true,
      true,
      dispatch,
      analyticsCallback,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(analyticsCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual(
      addUserSelectedPaymentRptId(paymentId)
    );
    expect(startPaymentFlowWithRptIdWorkaround).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationFiscalCode,
        paymentNoticeNumber: {
          auxDigit,
          applicationCode,
          iuv13,
          checkDigit
        }
      }),
      dispatch,
      expect.any(Function),
      { startOrigin: "message" }
    );
  });
  it("should navigate to Payment Transaction Summary with default 0-amount and no prenavigation callback", () => {
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const analyticsCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      paymentId,
      true,
      true,
      dispatch,
      analyticsCallback,
      decodeErrorCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(analyticsCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual(
      addUserSelectedPaymentRptId(paymentId)
    );
    expect(startPaymentFlowWithRptIdWorkaround).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationFiscalCode,
        paymentNoticeNumber: {
          auxDigit,
          applicationCode,
          iuv13,
          checkDigit
        }
      }),
      dispatch,
      expect.any(Function),
      { startOrigin: "message" }
    );
  });
  it("should navigate to Payment Transaction Summary with given amount and track PN event", () => {
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();
    const analyticsCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      paymentId,
      true,
      true,
      dispatch,
      analyticsCallback,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(1);
    expect(analyticsCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls[0][0]).toStrictEqual(
      addUserSelectedPaymentRptId(paymentId)
    );
    expect(startPaymentFlowWithRptIdWorkaround).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationFiscalCode,
        paymentNoticeNumber: {
          auxDigit,
          applicationCode,
          iuv13,
          checkDigit
        }
      }),
      dispatch,
      expect.any(Function),
      { startOrigin: "message" }
    );
  });
  it("should navigate to Payment Transaction Summary with given amount but not dispatch an `addUserSelectedPaymentRptId`", () => {
    const organizationFiscalCode = "11111111111";
    const auxDigit = "0";
    const applicationCode = "22";
    const iuv13 = "3333333333333";
    const checkDigit = "44";

    const paymentId = `${organizationFiscalCode}${auxDigit}${applicationCode}${iuv13}${checkDigit}`;

    const dispatch = jest.fn();
    const decodeErrorCallback = jest.fn();
    const prenavigationCallback = jest.fn();
    const analyticsCallback = jest.fn();

    initializeAndNavigateToWalletForPayment(
      paymentId,
      false,
      true,
      dispatch,
      analyticsCallback,
      decodeErrorCallback,
      prenavigationCallback
    );
    expect(decodeErrorCallback).not.toHaveBeenCalled();
    expect(prenavigationCallback).toHaveBeenCalledTimes(1);
    expect(analyticsCallback).toHaveBeenCalledTimes(1);
    expect(dispatch.mock.calls).toHaveLength(0);
    expect(startPaymentFlowWithRptIdWorkaround).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationFiscalCode,
        paymentNoticeNumber: {
          auxDigit,
          applicationCode,
          iuv13,
          checkDigit
        }
      }),
      dispatch,
      expect.any(Function),
      { startOrigin: "message" }
    );
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

describe("emptyMessageArray", () => {
  it("should return an empty array", () => {
    expect(emptyMessageArray).toStrictEqual([]);
  });
});

describe("extractContentFromMessageSources", () => {
  it("should return undefined if both input messages are undefined", () => {
    const content = extractContentFromMessageSources(
      data => data.markdown,
      undefined,
      undefined
    );
    expect(content).toBeUndefined();
  });
  it("should return standard message content if third party message is undefined", () => {
    const standardMessage = {
      markdown:
        "This is the standard message markdown which must be longer than eighty characters in order to be properly recognised"
    } as UIMessageDetails;
    const content = extractContentFromMessageSources(
      data => data.markdown,
      standardMessage,
      undefined
    );
    expect(content).toBe(standardMessage.markdown);
  });
  it("should return standard message content if third party message's details are undefined", () => {
    const standardMessage = {
      markdown:
        "This is the standard message markdown which must be longer than eighty characters in order to be properly recognised"
    } as UIMessageDetails;
    const remoteMessage = {
      third_party_message: {}
    } as ThirdPartyMessageWithContent;
    const content = extractContentFromMessageSources(
      data => data.markdown,
      standardMessage,
      remoteMessage
    );
    expect(content).toBe(standardMessage.markdown);
  });
  it("should return standard message content if third party message's details are not valid", () => {
    const standardMessage = {
      markdown:
        "This is the standard message markdown which must be longer than eighty characters in order to be properly recognised"
    } as UIMessageDetails;
    const remoteMessage = {
      third_party_message: {
        details: {
          markdown:
            "This is the remote markdown, which is longer than eighty characters but the sibling subject property is missing"
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;
    const content = extractContentFromMessageSources(
      data => data.markdown,
      standardMessage,
      remoteMessage
    );
    expect(content).toBe(standardMessage.markdown);
  });
  it("should return third party message content if it is properly defined and formatted", () => {
    const standardMessage = {
      markdown:
        "This is the standard message markdown which must be longer than eighty characters in order to be properly recognised"
    } as UIMessageDetails;
    const remoteMessageMarkdown =
      "This is the remote markdown, which is longer than eighty characters and the sibling subject property is defined";
    const remoteMessage = {
      third_party_message: {
        details: {
          markdown: remoteMessageMarkdown,
          subject: "This is the subject which must be a bit long"
        }
      } as ThirdPartyMessage
    } as ThirdPartyMessageWithContent;
    const content = extractContentFromMessageSources(
      data => data.markdown,
      standardMessage,
      remoteMessage
    );
    expect(content).toBe(remoteMessageMarkdown);
  });
});
