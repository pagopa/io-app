import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import FM from "front-matter";
import { CreatedMessageWithContent } from "../../../../../definitions/backend/CreatedMessageWithContent";
import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageContent } from "../../../../../definitions/backend/MessageContent";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";
import { Locales } from "../../../../../locales/locales";
import { setLocale } from "../../../../i18n";
import { CTA, CTAS, MessageCTA } from "../../types/MessageCTA";
import {
  cleanMarkdownFromCTAs,
  ctaFromMessageCTA,
  getMessageCTA,
  getRemoteLocale,
  getServiceCTA,
  testable,
  unsafeMessageCTAFromInput
} from "../ctas";
import * as ANALYTICS from "../../analytics";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../../definitions/backend/ServiceMetadata";

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

// test "it" as default language
beforeAll(() => setLocale("it" as Locales));
afterEach(() => jest.restoreAllMocks());

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
    expect(maybeCTA).toBeFalsy();
  });

  it("should not have a valid CTA, unrelated content", () => {
    const maybeCTA = getMessageCTA("nothing of nothing" as MessageBodyMarkdown);
    expect(maybeCTA).toBeFalsy();
  });

  it("should not have a valid CTA, invalid content format", () => {
    const NO_CTA = `---
it:
    act_1:
        txet: "premi"
        aa: "ioit://PROFILE_MAIN"
--- 
some noise`;
    const maybeCTA = getMessageCTA(NO_CTA as MessageBodyMarkdown);
    expect(maybeCTA).toBeFalsy();
  });
});

const test2CTA = (
  maybeCTAS: CTAS | undefined,
  text1: string,
  action1: string,
  text2: string,
  action2: string
) => {
  expect(maybeCTAS).toBeTruthy();
  if (maybeCTAS != null) {
    expect(maybeCTAS.cta_1).toBeDefined();
    expect(maybeCTAS.cta_2).toBeDefined();
    expect(maybeCTAS.cta_1.text).toEqual(text1);
    expect(maybeCTAS.cta_1.action).toEqual(action1);
    if (maybeCTAS.cta_2) {
      expect(maybeCTAS.cta_2.text).toEqual(text2);
      expect(maybeCTAS.cta_2.action).toEqual(action2);
    }
  }
};

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

  it("should return empty string for empty string input", () => {
    const input = "";
    const markdown = cleanMarkdownFromCTAs(input);
    expect(markdown).toBe("");
  });
  it("should return the markdown for a proper formatted message (with front matter and body)", () => {
    const input =
      "---\nit:\n cta_1:\n  text: Il testo\n  action: ioit://messages\nen:\n cta_1:\n  text: The text\n  action: ioit//messages\n---\nThis is the message body";
    const markdown = cleanMarkdownFromCTAs(input);
    expect(markdown).toBe("This is the message body");
  });
  it("should return input string for invalid front matter", () => {
    const input =
      "---\nit:\n cta_1:\n  text: Il testo  action: ioit://messages\nen:\n cta_1:\n  text: The text\n  action: ioit//messages\n---\nThis is the message body";
    const markdown = cleanMarkdownFromCTAs(input);
    expect(markdown).toBe(input);
  });
});

const ioHandledLinks = [
  "iosso://https://relyingParty.url",
  "ioit://whateverHere",
  "iohandledlink://http://whateverHere",
  "iohandledlink://https://whateverHere",
  "iohandledlink://sms://whateverHere",
  "iohandledlink://tel://whateverHere",
  "iohandledlink://mailto://whateverHere",
  "iohandledlink://copy://whateverHere"
];

describe("getCTAIfValid", () => {
  it("should return CTAS from valid input string with both CTAs", () => {
    const validCTAs = `---
it:
  cta_1:
    text: "Testo CTA1"
    action: "ioit://messages"
  cta_2:
    text: "Testo CTA2"
    action: "ioit://services"
en:
  cta_1:
    text: "CTA1 Text"
    action: "ioit://messages"
  cta_2:
    text: "CTA2 Text"
    action: "ioit://services"
---`;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(validCTAs);

    expect(spyOnAnalytics.mock.calls.length).toBe(0);
    expect(verifiedCTAOrUndefined).toEqual({
      cta_1: {
        text: "Testo CTA1",
        action: "ioit://messages"
      },
      cta_2: {
        text: "Testo CTA2",
        action: "ioit://services"
      }
    });
  });
  it("should return CTAS from valid input string with only CTA 1", () => {
    const validCTA1 = `---
it:
  cta_1:
    text: "Testo CTA1"
    action: "ioit://messages"
en:
  cta_1:
    text: "CTA1 Text"
    action: "ioit://messages"
---`;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(validCTA1);

    expect(spyOnAnalytics.mock.calls.length).toBe(0);
    expect(verifiedCTAOrUndefined).toEqual({
      cta_1: {
        text: "Testo CTA1",
        action: "ioit://messages"
      }
    });
  });
  it("should return undefined from input string with only CTA 2", () => {
    const validCTAs = `---
it:
  cta_2:
    text: "Testo CTA2"
    action: "ioit://services"
en:
  cta_2:
    text: "CTA2 Text"
    action: "ioit://services"
---`;
    const serviceId = "01JKB81F4HE9WQWJFD7JET9ZFN" as ServiceId;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(
      validCTAs,
      undefined,
      serviceId
    );

    expect(spyOnAnalytics.mock.calls.length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0].length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0][0]).toBe(serviceId);
    expect(verifiedCTAOrUndefined).toBeUndefined();
  });
  it("should return CTAS from input string with invalid CTA1 action but valid CTA2 action", () => {
    const validCTAs = `---
it:
  cta_1:
    text: "Testo CTA1"
    action: "thisIsNotValid"
  cta_2:
    text: "Testo CTA2"
    action: "ioit://services"
en:
  cta_1:
    text: "CTA1 Text"
    action: "thisIsNotValid"
  cta_2:
    text: "CTA2 Text"
    action: "ioit://services"
---`;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(validCTAs);

    expect(spyOnAnalytics.mock.calls.length).toBe(0);
    expect(verifiedCTAOrUndefined).toEqual({
      cta_1: {
        action: "thisIsNotValid",
        text: "Testo CTA1"
      },
      cta_2: {
        action: "ioit://services",
        text: "Testo CTA2"
      }
    });
  });
  it("should return undefined from input string with valid CTA1 action and invalid CTA2 action", () => {
    const validCTAs = `---
    it:
      cta_1:
        text: "Testo CTA1"
        action: "ioit://messages"
      cta_2:
        text: "Testo CTA2"
        action: "thisIsNotValid"
    en:
      cta_1:
        text: "CTA1 Text"
        action: "ioit://messages"
      cta_2:
        text: "CTA2 Text"
        action: "thisIsNotValid"
    ---`;
    const serviceId = "01JKB81F4HE9WQWJFD7JET9ZFN" as ServiceId;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(
      validCTAs,
      undefined,
      serviceId
    );

    expect(spyOnAnalytics.mock.calls.length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0].length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0][0]).toBe(serviceId);
    expect(verifiedCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined from invalid input string", () => {
    const serviceId = "01JKB81F4HE9WQWJFD7JET9ZFN" as ServiceId;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(
      "invalidInputString",
      undefined,
      serviceId
    );

    expect(spyOnAnalytics.mock.calls.length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0].length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0][0]).toBe(serviceId);
    expect(verifiedCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined from undefined input string", () => {
    const serviceId = "01JKB81F4HE9WQWJFD7JET9ZFN" as ServiceId;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(
      undefined,
      undefined,
      serviceId
    );

    expect(spyOnAnalytics.mock.calls.length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0].length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0][0]).toBe(serviceId);
    expect(verifiedCTAOrUndefined).toBeUndefined();
  });
  ioHandledLinks.forEach(action => {
    it(`should return CTAS from valid input string with only CTA 1 and action (${action})`, () => {
      const validCTA1 = `---
it:
  cta_1:
    text: "Testo CTA1"
    action: "${action}"
en:
  cta_1:
    text: "CTA1 Text"
    action: "${action}"
---`;
      const spyOnAnalytics = jest
        .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
        .mockReturnValue(undefined);

      const verifiedCTAOrUndefined = testable!.getCTAIfValid(validCTA1);

      expect(spyOnAnalytics.mock.calls.length).toBe(0);
      expect(verifiedCTAOrUndefined).toEqual({
        cta_1: {
          text: "Testo CTA1",
          action
        }
      });
    });
  });
  it(`should return undefined from valid input string with only CTA 1 and invalid iohandledlink action`, () => {
    const validCTA1 = `---
it:
cta_1:
  text: "Testo CTA1"
  action: "iohandledlink://notSupported://whatever"
en:
cta_1:
  text: "CTA1 Text"
  action: "iohandledlink://notSupported://whatever"
---`;
    const serviceId = "01JKB81F4HE9WQWJFD7JET9ZFN" as ServiceId;
    const spyOnAnalytics = jest
      .spyOn(ANALYTICS, "trackMessageCTAFrontMatterDecodingError")
      .mockReturnValue(undefined);

    const verifiedCTAOrUndefined = testable!.getCTAIfValid(
      validCTA1,
      undefined,
      serviceId
    );

    expect(spyOnAnalytics.mock.calls.length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0].length).toBe(1);
    expect(spyOnAnalytics.mock.calls[0][0]).toBe(serviceId);
    expect(verifiedCTAOrUndefined).toBeUndefined();
  });
});

describe("hasCtaValidActions", () => {
  it("should return true if cta1 action is valid, with undefined cta2", () => {
    const ctas: CTAS = {
      cta_1: {
        action: "ioit://messages",
        text: "CTA1 text"
      }
    };

    const hasValidActions = testable!.hasCtaValidActions(ctas, undefined);

    expect(hasValidActions).toBe(true);
  });
  it("should return true if cta1 action is valid, with invalid cta2", () => {
    const ctas: CTAS = {
      cta_1: {
        action: "ioit://messages",
        text: "CTA1 text"
      },
      cta_2: {
        action: "thisIsInvalid",
        text: "CTA2 text"
      }
    };

    const hasValidActions = testable!.hasCtaValidActions(ctas, undefined);

    expect(hasValidActions).toBe(true);
  });
  it("should return true if cta1 action is invalid but cta2 is valid", () => {
    const ctas: CTAS = {
      cta_1: {
        action: "thisIsInvalid",
        text: "CTA1 text"
      },
      cta_2: {
        action: "ioit://messages",
        text: "CTA2 text"
      }
    };

    const hasValidActions = testable!.hasCtaValidActions(ctas, undefined);

    expect(hasValidActions).toBe(true);
  });
  it("should return false if both ctas are invalid", () => {
    const ctas: CTAS = {
      cta_1: {
        action: "thisIsInvalid",
        text: "CTA1 text"
      },
      cta_2: {
        action: "thisIsInvalid",
        text: "CTA2 text"
      }
    };

    const hasValidActions = testable!.hasCtaValidActions(ctas, undefined);

    expect(hasValidActions).toBe(false);
  });
});

describe("hasMetadataTokenName", () => {
  it("should return false if metadata are undefined", () => {
    const hasTokenName = testable!.hasMetadataTokenName();

    expect(hasTokenName).toBe(false);
  });
  it("should return false if metadata's token_name is undefined", () => {
    const metadata = {} as ServiceMetadata;

    const hasTokenName = testable!.hasMetadataTokenName(metadata);

    expect(hasTokenName).toBe(false);
  });
  it("should return true if metadata's token_name defined", () => {
    const metadata = {
      token_name: "a token name"
    } as ServiceMetadata;

    const hasTokenName = testable!.hasMetadataTokenName(metadata);

    expect(hasTokenName).toBe(true);
  });
});

describe("internalRoutePredicates", () => {
  it("should match expected values", () => {
    const map = testable!.internalRoutePredicates;

    expect(map.size).toBe(1);

    const keys = Array.from(map.keys());
    expect(keys.length).toBe(1);
    expect(keys[0]).toBe("/services/webview");

    const values = Array.from(map.values());
    expect(values.length).toBe(1);
    expect(values[0]).toBe(testable!.hasMetadataTokenName);
  });
});

describe("isCtaActionValid", () => {
  it("should return true for ioit://whatever", () => {
    const cta: CTA = {
      action: "ioit://whatever",
      text: "CTA text"
    };

    const isValid = testable!.isCtaActionValid(cta);

    expect(isValid).toBe(true);
  });
  it("should return false for ioit://services/webview with undefined metadata", () => {
    const cta: CTA = {
      action: "ioit://services/webview",
      text: "CTA text"
    };

    const isValid = testable!.isCtaActionValid(cta);

    expect(isValid).toBe(false);
  });
  it("should return false for ioit://services/webview with metadata with undefined token_name", () => {
    const cta: CTA = {
      action: "ioit://services/webview",
      text: "CTA text"
    };
    const metadata = {} as ServiceMetadata;

    const isValid = testable!.isCtaActionValid(cta, metadata);

    expect(isValid).toBe(false);
  });
  it("should return true for iosso://https://relyingParty.url", () => {
    const cta: CTA = {
      action: "iosso://https://relyingParty.url",
      text: "CTA text"
    };

    const isValid = testable!.isCtaActionValid(cta);

    expect(isValid).toBe(true);
  });
  ioHandledLinks.forEach(ioHandledLink =>
    it(`should return true for ${ioHandledLink}`, () => {
      const cta: CTA = {
        action: ioHandledLink,
        text: "CTA text"
      };

      const isValid = testable!.isCtaActionValid(cta);

      expect(isValid).toBe(true);
    })
  );
  it(`should return false for iohandledlink://whatever`, () => {
    const cta: CTA = {
      action: "iohandledlink://whatever",
      text: "CTA text"
    };

    const isValid = testable!.isCtaActionValid(cta);

    expect(isValid).toBe(false);
  });
  it(`should return false for invalid action`, () => {
    const cta: CTA = {
      action: "invalid",
      text: "CTA text"
    };

    const isValid = testable!.isCtaActionValid(cta);

    expect(isValid).toBe(false);
  });
});

describe("unsafeMessageCTAFromInput", () => {
  it("should return undefined if input is undefined", () => {
    const messageCTAOrUndefined = unsafeMessageCTAFromInput(undefined);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined if input is not a frontmatter", () => {
    const input = "This is not a front matter";
    const messageCTAOrUndefined = unsafeMessageCTAFromInput(input);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined if input is not properly formatted", () => {
    const input = `---it: cta_1: text: "The text" action: "ioit://messages"---`;
    const messageCTAOrUndefined = unsafeMessageCTAFromInput(input);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined if input has invalid sequences (unclosed string)", () => {
    const input = `---\nit:\n cta_1:\n  text: "The text"\n  action: "ioit://messages\n---`;
    const messageCTAOrUndefined = unsafeMessageCTAFromInput(input);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return a MessageCTA instance if input is properly formatted", () => {
    const input = `---\nit:\n cta_1:\n  text: "The text"\n  action: "ioit://messages"\n---`;
    const messageCTAOrUndefined = unsafeMessageCTAFromInput(input);
    expect(messageCTAOrUndefined).toEqual({
      it: {
        cta_1: {
          text: "The text",
          action: "ioit://messages"
        }
      }
    });
  });
});

describe("ctaFromMessageCTA", () => {
  it("should return undefined if input is undefined", () => {
    const ctas = ctaFromMessageCTA(undefined);
    expect(ctas).toBeUndefined();
  });
  [
    {},
    { it: {} },
    { it: {}, en: {} },
    { it: {}, en: { cta_1: {} } },
    { it: {}, en: { cta_1: {}, cta_2: {} } },
    { it: {}, en: { cta_1: {}, cta_2: { action: "" } } },
    { it: {}, en: { cta_1: {}, cta_2: { text: "" } } },
    { it: {}, en: { cta_1: {}, cta_2: { text: "", action: "" } } },
    { it: {}, en: { cta_1: { text: "" } } },
    { it: {}, en: { cta_1: { text: "" }, cta_2: {} } },
    { it: {}, en: { cta_1: { text: "" }, cta_2: { action: "" } } },
    { it: {}, en: { cta_1: { text: "" }, cta_2: { text: "" } } },
    { it: {}, en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } } },
    { it: {}, en: { cta_1: { action: "" } } },
    { it: {}, en: { cta_1: { action: "" }, cta_2: {} } },
    { it: {}, en: { cta_1: { action: "" }, cta_2: { action: "" } } },
    { it: {}, en: { cta_1: { action: "" }, cta_2: { text: "" } } },
    { it: {}, en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } } },
    { it: {}, en: { cta_2: {} } },
    { it: {}, en: { cta_2: { text: "" } } },
    { it: {}, en: { cta_2: { action: "" } } },
    { it: {}, en: { cta_2: { action: "", text: "" } } },

    { it: { cta_1: {} } },
    { it: { cta_1: {} }, en: {} },
    { it: { cta_1: {} }, en: { cta_1: {} } },
    { it: { cta_1: {} }, en: { cta_1: {}, cta_2: {} } },
    { it: { cta_1: {} }, en: { cta_1: {}, cta_2: { action: "" } } },
    { it: { cta_1: {} }, en: { cta_1: {}, cta_2: { text: "" } } },
    { it: { cta_1: {} }, en: { cta_1: {}, cta_2: { text: "", action: "" } } },
    { it: { cta_1: {} }, en: { cta_1: { text: "" } } },
    { it: { cta_1: {} }, en: { cta_1: { text: "" }, cta_2: {} } },
    { it: { cta_1: {} }, en: { cta_1: { text: "" }, cta_2: { action: "" } } },
    { it: { cta_1: {} }, en: { cta_1: { text: "" }, cta_2: { text: "" } } },
    {
      it: { cta_1: {} },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {} }, en: { cta_1: { action: "" } } },
    { it: { cta_1: {} }, en: { cta_1: { action: "" }, cta_2: {} } },
    { it: { cta_1: {} }, en: { cta_1: { action: "" }, cta_2: { action: "" } } },
    { it: { cta_1: {} }, en: { cta_1: { action: "" }, cta_2: { text: "" } } },
    {
      it: { cta_1: {} },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {} }, en: { cta_2: {} } },
    { it: { cta_1: {} }, en: { cta_2: { text: "" } } },
    { it: { cta_1: {} }, en: { cta_2: { action: "" } } },
    { it: { cta_1: {} }, en: { cta_2: { action: "", text: "" } } },

    { it: { cta_1: { action: "" } } },
    { it: { cta_1: { action: "" } }, en: {} },
    { it: { cta_1: { action: "" } }, en: { cta_1: {} } },
    { it: { cta_1: { action: "" } }, en: { cta_1: {}, cta_2: {} } },
    { it: { cta_1: { action: "" } }, en: { cta_1: {}, cta_2: { action: "" } } },
    { it: { cta_1: { action: "" } }, en: { cta_1: {}, cta_2: { text: "" } } },
    {
      it: { cta_1: { action: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    { it: { cta_1: { action: "" } }, en: { cta_1: { text: "" } } },
    { it: { cta_1: { action: "" } }, en: { cta_1: { text: "" }, cta_2: {} } },
    {
      it: { cta_1: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { action: "" } }, en: { cta_1: { action: "" } } },
    { it: { cta_1: { action: "" } }, en: { cta_1: { action: "" }, cta_2: {} } },
    {
      it: { cta_1: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { action: "" } }, en: { cta_2: {} } },
    { it: { cta_1: { action: "" } }, en: { cta_2: { text: "" } } },
    { it: { cta_1: { action: "" } }, en: { cta_2: { action: "" } } },
    { it: { cta_1: { action: "" } }, en: { cta_2: { action: "", text: "" } } },

    { it: { cta_1: { text: "" } } },
    { it: { cta_1: { text: "" } }, en: {} },
    { it: { cta_1: { text: "" } }, en: { cta_1: {} } },
    { it: { cta_1: { text: "" } }, en: { cta_1: {}, cta_2: {} } },
    { it: { cta_1: { text: "" } }, en: { cta_1: {}, cta_2: { action: "" } } },
    { it: { cta_1: { text: "" } }, en: { cta_1: {}, cta_2: { text: "" } } },
    {
      it: { cta_1: { text: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    { it: { cta_1: { text: "" } }, en: { cta_1: { text: "" } } },
    { it: { cta_1: { text: "" } }, en: { cta_1: { text: "" }, cta_2: {} } },
    {
      it: { cta_1: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { text: "" } }, en: { cta_1: { action: "" } } },
    { it: { cta_1: { text: "" } }, en: { cta_1: { action: "" }, cta_2: {} } },
    {
      it: { cta_1: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { text: "" } }, en: { cta_2: {} } },
    { it: { cta_1: { text: "" } }, en: { cta_2: { text: "" } } },
    { it: { cta_1: { text: "" } }, en: { cta_2: { action: "" } } },
    { it: { cta_1: { text: "" } }, en: { cta_2: { action: "", text: "" } } },

    { it: { cta_1: {}, cta_2: {} } },
    { it: { cta_1: {}, cta_2: {} }, en: {} },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: {} } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: {}, cta_2: {} } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: {}, cta_2: { action: "" } } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: {}, cta_2: { text: "" } } },
    {
      it: { cta_1: {}, cta_2: {} },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: { text: "" } } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: { text: "" }, cta_2: {} } },
    {
      it: { cta_1: {}, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: { action: "" } } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_1: { action: "" }, cta_2: {} } },
    {
      it: { cta_1: {}, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_2: {} } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_2: { text: "" } } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_2: { action: "" } } },
    { it: { cta_1: {}, cta_2: {} }, en: { cta_2: { action: "", text: "" } } },

    { it: { cta_1: { action: "" }, cta_2: {} } },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: {} },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: { cta_1: {} } },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: { cta_1: {}, cta_2: {} } },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: { cta_1: { text: "" } } },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: { cta_1: { action: "" } } },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: { cta_2: {} } },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: { cta_2: { text: "" } } },
    { it: { cta_1: { action: "" }, cta_2: {} }, en: { cta_2: { action: "" } } },
    {
      it: { cta_1: { action: "" }, cta_2: {} },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: { text: "" }, cta_2: {} } },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: {} },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: { cta_1: {} } },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: { cta_1: {}, cta_2: {} } },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: { cta_1: { text: "" } } },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: { cta_1: { action: "" } } },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: { cta_2: {} } },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: { cta_2: { text: "" } } },
    { it: { cta_1: { text: "" }, cta_2: {} }, en: { cta_2: { action: "" } } },
    {
      it: { cta_1: { text: "" }, cta_2: {} },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: {}, cta_2: { action: "" } } },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: {} },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: { cta_1: {} } },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: { cta_1: {}, cta_2: {} } },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: { cta_1: { text: "" } } },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: { cta_1: { action: "" } } },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: { cta_2: {} } },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: { cta_2: { text: "" } } },
    { it: { cta_1: {}, cta_2: { action: "" } }, en: { cta_2: { action: "" } } },
    {
      it: { cta_1: {}, cta_2: { action: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: { action: "" }, cta_2: { action: "" } } },
    { it: { cta_1: { action: "" }, cta_2: { action: "" } }, en: {} },
    { it: { cta_1: { action: "" }, cta_2: { action: "" } }, en: { cta_1: {} } },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { action: "" }, cta_2: { action: "" } }, en: { cta_2: {} } },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: { text: "" }, cta_2: { action: "" } } },
    { it: { cta_1: { text: "" }, cta_2: { action: "" } }, en: {} },
    { it: { cta_1: { text: "" }, cta_2: { action: "" } }, en: { cta_1: {} } },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { text: "" }, cta_2: { action: "" } }, en: { cta_2: {} } },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: {}, cta_2: { text: "" } } },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: {} },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: { cta_1: {} } },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: { cta_1: {}, cta_2: {} } },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: { cta_1: { text: "" } } },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: { cta_1: { action: "" } } },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: { cta_2: {} } },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: { cta_2: { text: "" } } },
    { it: { cta_1: {}, cta_2: { text: "" } }, en: { cta_2: { action: "" } } },
    {
      it: { cta_1: {}, cta_2: { text: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: { action: "" }, cta_2: { text: "" } } },
    { it: { cta_1: { action: "" }, cta_2: { text: "" } }, en: {} },
    { it: { cta_1: { action: "" }, cta_2: { text: "" } }, en: { cta_1: {} } },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { action: "" }, cta_2: { text: "" } }, en: { cta_2: {} } },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { text: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: { text: "" }, cta_2: { text: "" } } },
    { it: { cta_1: { text: "" }, cta_2: { text: "" } }, en: {} },
    { it: { cta_1: { text: "" }, cta_2: { text: "" } }, en: { cta_1: {} } },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: { text: "" }, cta_2: { text: "" } }, en: { cta_2: {} } },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { text: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: {}, cta_2: { action: "", text: "" } } },
    { it: { cta_1: {}, cta_2: { action: "", text: "" } }, en: {} },
    { it: { cta_1: {}, cta_2: { action: "", text: "" } }, en: { cta_1: {} } },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: {} }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    { it: { cta_1: {}, cta_2: { action: "", text: "" } }, en: { cta_2: {} } },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_2: { text: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_2: { action: "" } }
    },
    {
      it: { cta_1: {}, cta_2: { action: "", text: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } } },
    { it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }, en: {} },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: {} }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: { text: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: { action: "" } }
    },
    {
      it: { cta_1: { action: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: { action: "", text: "" } }
    },

    { it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } } },
    { it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }, en: {} },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: {}, cta_2: { text: "", action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { text: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_1: { action: "" }, cta_2: { action: "", text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: {} }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: { text: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: { action: "" } }
    },
    {
      it: { cta_1: { text: "" }, cta_2: { action: "", text: "" } },
      en: { cta_2: { action: "", text: "" } }
    }
  ].forEach(invalidMessageCTA => {
    it(`should return undefined if input does not have the CTA (${JSON.stringify(
      invalidMessageCTA
    )})`, () => {
      const messageCTA = invalidMessageCTA as MessageCTA;
      const ctas = ctaFromMessageCTA(messageCTA);
      expect(ctas).toBeUndefined();
    });
  });
  it("should return CTAS if input is correct", () => {
    const messageCTA: MessageCTA = {
      it: {
        cta_1: {
          text: "The text",
          action: "ioit://messages"
        }
      }
    };
    const ctas = ctaFromMessageCTA(messageCTA);
    expect(ctas).toEqual({
      cta_1: {
        text: "The text",
        action: "ioit://messages"
      }
    });
  });
});

describe("getServiceCTA", () => {
  it("should return undefined if input is undefined", () => {
    const serviceCTA = getServiceCTA();
    expect(serviceCTA).toBeUndefined();
  });
  it("should return undefined if input service has no cta", () => {
    const serviceMetadata = {} as ServiceMetadata;
    const serviceCTA = getServiceCTA(serviceMetadata);
    expect(serviceCTA).toBeUndefined();
  });
  it("should return the CTA if input service has a properly formatted cta", () => {
    const serviceMetadata = {
      cta: `---\nit:\n cta_1:\n  action: "ioit://messages"\n  text: "CTA's text"\n---`
    } as ServiceMetadata;
    const serviceCTA = getServiceCTA(serviceMetadata);
    expect(serviceCTA).toEqual({
      cta_1: {
        action: "ioit://messages",
        text: "CTA's text"
      }
    });
  });
});

describe("safeContainsFronMatter", () => {
  it("should return false for empty string", () => {
    const input = "";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for non front matter string", () => {
    const input = "it:\n cta_1:\n  text: The text";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for non opening front matter", () => {
    const input = "it:\n cta_1:\n  text: The text\n---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for non closing front matter", () => {
    const input = "---\nit:\n cta_1:\n  text: The text";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for opening front matter without newline", () => {
    const input = "---it:\n cta_1:\n  text: The text\n---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for closing front matter without newline", () => {
    const input = "---\nit:\n cta_1:\n  text: The text---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for proper front matter that has extra characters (on the same line) after closing", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---Something else";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for proper front matter that has extra space before opening", () => {
    const input = " ---\nit:\n cta_1:\n  text: The text\n---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for proper front matter that has extra space before closing", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n ---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false for a front matter that has wrong opening", () => {
    const input = "...\nit:\n cta_1:\n  text: The text\n---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
  });
  it("should return false if the library throws an exception", () => {
    jest.spyOn(FM, "test").mockImplementation(_input => {
      throw Error("An error");
    });
    const input = "---\nit:\n cta_1:\n  text: The text\n---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(false);
    jest.restoreAllMocks();
  });
  it("should return true for proper front matter", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(true);
  });
  it("should return true for proper front matter with invalid yaml", () => {
    const input = "---\nit: cta_1: text: The text\n---";
    const containsFrontMatter = testable!.safeContainsFrontMatter(input);
    expect(containsFrontMatter).toBe(true);
  });
});

describe("safeExtractBodyAfterFrontMatter", () => {
  it("should return input string for non opening front matter", () => {
    const input = "it:\n cta_1:\n  text: The text\n---\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should return input string for non closing front matter", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should return input string for opening front matter without newline", () => {
    const input = "---it:\n cta_1:\n  text: The text\n---\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should return input string for closing front matter without newline", () => {
    const input = "---\nit:\n cta_1:\n  text: The text---\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should return input string for proper front matter that has extra characters (on the same line) after closing", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---This is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should return input string for proper front matter that has extra space before opening", () => {
    const input = " ---\nit:\n cta_1:\n  text: The text\n---\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should return input string for proper front matter that has extra space before closing", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n ---\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should return input string for a front matter that has wrong opening", () => {
    const input = "...\nit:\n cta_1:\n  text: The text\n---\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe(input);
  });
  it("should extract body for valid front matter", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---\nThis is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe("This is the body");
  });
  it("should extract body for a string with no front matter", () => {
    const input = "This is the body";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe("This is the body");
  });
  it("should extract empty body from an empty string", () => {
    const input = "";
    const body = testable!.safeExtractBodyAfterFrontMatter(input);
    expect(body).toBe("");
  });
});
