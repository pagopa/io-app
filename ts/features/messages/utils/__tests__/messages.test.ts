import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import * as O from "fp-ts/lib/Option";
import { CreatedMessageWithContent } from "../../../../../definitions/backend/CreatedMessageWithContent";
import { CreatedMessageWithContentAndAttachments } from "../../../../../definitions/backend/CreatedMessageWithContentAndAttachments";
import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageContent } from "../../../../../definitions/backend/MessageContent";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";
import { Locales } from "../../../../../locales/locales";
import { setLocale } from "../../../../i18n";
import { CTA, CTAS } from "../../types/MessageCTA";
import {
  cleanMarkdownFromCTAs,
  getMessageCTA,
  getMessagePaymentExpirationInfo,
  getRemoteLocale,
  isCtaActionValid,
  MessagePaymentExpirationInfo,
  paymentExpirationInfo
} from "../messages";

const messageBody = `### this is a message

this is a body`;

const CTA_2 =
  `---
it:
    cta_1: 
        text: "premi"
        action: "ioit://PROFILE_MAIN"
    cta_2: 
        text: "premi2"
        action: "ioit://PROFILE_MAIN2"
en:
    cta_1: 
        text: "go1"
        action: "ioit://PROFILE_MAIN"
    cta_2: 
        text: "go2"
        action: "ioit://PROFILE_MAIN2"
---
` + messageBody;

const messageWithoutPaymentData: CreatedMessageWithContent = {
  created_at: new Date(),
  fiscal_code: "RSSMRA83A12H501D" as FiscalCode,
  id: "93726BD8-D29C-48F2-AE6D-2F",
  sender_service_id: "dev-service_0" as ServiceId,
  time_to_live: 3600 as TimeToLiveSeconds,
  content: {
    subject: "Subject - test 1" as MessageSubject,
    markdown: CTA_2 as MessageBodyMarkdown
  }
};

const messageWithContentWithoutDueDate = {
  created_at: new Date(),
  fiscal_code: "RSSMRA83A12H501D" as FiscalCode,
  id: "93726BD8-D29C-48F2-AE6D-2F",
  sender_service_id: "dev-service_0",
  time_to_live: 3600 as TimeToLiveSeconds,
  content: {
    subject: "Subject - test 1",
    markdown: CTA_2,
    payment_data: {
      notice_number: "012345678912345678",
      amount: 406,
      invalid_after_due_date: false,
      payee: {
        fiscal_code: "00000000001" as OrganizationFiscalCode
      }
    }
  } as MessageContent
} as CreatedMessageWithContent;

const messageWithContent = {
  ...messageWithContentWithoutDueDate,
  content: { ...messageWithContentWithoutDueDate.content, due_date: new Date() }
};

const messageInvalidAfterDueDate = {
  ...messageWithContent,
  content: {
    ...messageWithContent.content,
    payment_data: {
      notice_number: "012345678912345678",
      amount: 406,
      invalid_after_due_date: true,
      payee: {
        fiscal_code: "00000000001" as OrganizationFiscalCode
      }
    }
  }
};

// test "it" as default language
beforeAll(() => setLocale("it" as Locales));

describe("getRemoteLocale", () => {
  it("should return it if locale is it", () => {
    setLocale("it" as Locales);
    expect(getRemoteLocale()).toEqual("it");
  });

  it("should return en if locale is en", () => {
    setLocale("en" as Locales);
    expect(getRemoteLocale()).toEqual("en");
  });

  it("should return it if locale is a supported language but is not in MessageCTALocales", () => {
    setLocale("de" as Locales);
    expect(getRemoteLocale()).toEqual("it");
  });

  it("should return it if locale is not a supported language and is not in MessageCTALocales", () => {
    setLocale("xyz" as Locales);
    expect(getRemoteLocale()).toEqual("it");
  });
});

describe("getCTA", () => {
  it("should have 2 valid CTA", () => {
    const maybeCTAs = getMessageCTA(messageWithContent.content.markdown);
    test2CTA(
      maybeCTAs,
      "premi",
      "ioit://PROFILE_MAIN",
      "premi2",
      "ioit://PROFILE_MAIN2"
    );
    setLocale("en" as Locales);
    const maybeCTAsEn = getMessageCTA(messageWithContent.content.markdown);
    test2CTA(
      maybeCTAsEn,
      "go1",
      "ioit://PROFILE_MAIN",
      "go2",
      "ioit://PROFILE_MAIN2"
    );
  });

  it("should return the italian CTA when the language is not supported", () => {
    setLocale("fr" as Locales);
    const maybeCTAs = getMessageCTA(messageWithContent.content.markdown);
    test2CTA(
      maybeCTAs,
      "premi",
      "ioit://PROFILE_MAIN",
      "premi2",
      "ioit://PROFILE_MAIN2"
    );
    setLocale("it" as Locales); // restore default
  });

  it("should not have valid CTA (action is malformed)", () => {
    const CTA_1 = `---
it:
    cta_1:
        text: "premi"
        action: "io://PROFILE_MAIN"
--- 
some noise`;

    const maybeCTA = getMessageCTA(CTA_1 as MessageBodyMarkdown);
    expect(O.isNone(maybeCTA));
  });

  it("should not have a valid CTA", () => {
    const maybeCTA = getMessageCTA("nothing of nothing" as MessageBodyMarkdown);
    expect(O.isNone(maybeCTA)).toBeTruthy();
  });

  it("should not have a valid CTA", () => {
    const NO_CTA = `---
it:
    act_1:
        txet: "premi"
        aa: "ioit://PROFILE_MAIN"
--- 
some noise`;
    const maybeCTA = getMessageCTA(NO_CTA as MessageBodyMarkdown);
    expect(O.isNone(maybeCTA)).toBeTruthy();
  });
});

const test2CTA = (
  maybeCTAS: O.Option<CTAS>,
  text1: string,
  action1: string,
  text2: string,
  action2: string
) => {
  expect(O.isSome(maybeCTAS)).toBeTruthy();
  if (O.isSome(maybeCTAS)) {
    const ctas = maybeCTAS.value;
    expect(ctas.cta_1).toBeDefined();
    expect(ctas.cta_2).toBeDefined();
    expect(ctas.cta_1.text).toEqual(text1);
    expect(ctas.cta_1.action).toEqual(action1);
    if (ctas.cta_2) {
      expect(ctas.cta_2.text).toEqual(text2);
      expect(ctas.cta_2.action).toEqual(action2);
    }
  }
};

describe("isCtaActionValid", () => {
  it("should be a valid internal navigation action", async () => {
    const valid: CTA = { text: "dummy", action: "ioit://PROFILE_MAIN" };
    const isValid = isCtaActionValid(valid);
    expect(isValid).toBeTruthy();
  });

  it("should be not valid (wrong protocol)", async () => {
    const invalidProtocol: CTA = {
      text: "dummy",
      action: "iosit://PROFILE_MAIN"
    };
    const isValid = isCtaActionValid(invalidProtocol);
    expect(isValid).toBeFalsy();
  });

  it("should be not valid (wrong route)", async () => {
    const invalidRoute: CTA = { text: "dummy", action: "iosit://WRONG_ROUTE" };
    const isValid = isCtaActionValid(invalidRoute);
    expect(isValid).toBeFalsy();
  });

  it("should be a valid RN Linking", async () => {
    const phoneCtaValid: CTA = {
      text: "dummy",
      action: "iohandledlink://tel://3471615647"
    };
    const isValid = isCtaActionValid(phoneCtaValid);
    expect(isValid).toBeTruthy();
  });

  it("should be a valid RN Linking (web)", async () => {
    const webCtaValid: CTA = {
      text: "dummy",
      action: "iohandledlink://https://www.google.it"
    };
    const isValid = isCtaActionValid(webCtaValid);
    expect(isValid).toBeTruthy();
  });
});

describe("cleanMarkdownFromCTAs", () => {
  it("should be the same", async () => {
    const markdown = "simple text";
    const cleaned = cleanMarkdownFromCTAs(markdown as MessageBodyMarkdown);
    expect(cleaned).toEqual(markdown);
  });

  it("should be cleaned", async () => {
    const withCTA = `---
it:
    cta_1:
        text: "premi"
        action: "io://PROFILE_MAIN"
--- 
some noise`;
    const cleaned = cleanMarkdownFromCTAs(withCTA as MessageBodyMarkdown);
    expect(cleaned).toEqual("some noise");
  });

  it("should be cleaned (extended version)", async () => {
    const cleaned = cleanMarkdownFromCTAs(CTA_2 as MessageBodyMarkdown);
    expect(cleaned).toEqual(messageBody);
  });
});

describe("getMessagePaymentExpirationInfo", () => {
  it("should return an object with type UNEXPIRABLE if there isn't a duedate", () => {
    const messagePaymentExpirationInfo = getMessagePaymentExpirationInfo(
      messageWithContentWithoutDueDate.content.payment_data as NonNullable<
        CreatedMessageWithContentAndAttachments["content"]["payment_data"]
      >
    );
    const expectedInfo = {
      kind: "UNEXPIRABLE"
    };
    expect(messagePaymentExpirationInfo).toStrictEqual(expectedInfo);
  });
  it("should return an object with type UNEXPIRABLE if there a duedate but invalid_after_due_date is false", () => {
    const messagePaymentExpirationInfo = getMessagePaymentExpirationInfo(
      messageWithContent.content.payment_data as NonNullable<
        CreatedMessageWithContentAndAttachments["content"]["payment_data"]
      >,
      messageWithContent.content.due_date
    );
    const expectedInfo = {
      kind: "UNEXPIRABLE",
      expireStatus: "EXPIRED",
      dueDate: messageWithContent.content.due_date
    };
    expect(messagePaymentExpirationInfo).toStrictEqual(expectedInfo);
  });
  it("should return an object with type EXPIRABLE if there a duedate and invalid_after_due_date is true", () => {
    const messagePaymentExpirationInfo = getMessagePaymentExpirationInfo(
      messageInvalidAfterDueDate.content.payment_data as NonNullable<
        CreatedMessageWithContentAndAttachments["content"]["payment_data"]
      >,
      messageInvalidAfterDueDate.content.due_date
    );

    const expectedInfo = {
      kind: "EXPIRABLE",
      expireStatus: "EXPIRED",
      dueDate: messageInvalidAfterDueDate.content.due_date
    };
    expect(messagePaymentExpirationInfo).toStrictEqual(expectedInfo);
  });
});

describe("paymentExpirationInfo", () => {
  it("should be None if there isn't payment data in the message", () => {
    const expirationInfo = paymentExpirationInfo(messageWithoutPaymentData);
    expect(O.isNone(expirationInfo)).toBe(true);
  });
  it("should be a MessagePaymentExpirationInfo if there is payment data in the message", () => {
    const expirationInfo = paymentExpirationInfo(messageWithoutPaymentData);
    if (O.isSome(expirationInfo)) {
      expect(expirationInfo.value).toBeInstanceOf(
        {} as MessagePaymentExpirationInfo
      );
    }
  });
});
