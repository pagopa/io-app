import * as E from "fp-ts/lib/Either";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { Linking } from "react-native";
import FM from "front-matter";
import { CreatedMessageWithContent } from "../../../../../definitions/backend/CreatedMessageWithContent";
import { FiscalCode } from "../../../../../definitions/backend/FiscalCode";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageContent } from "../../../../../definitions/backend/MessageContent";
import { TimeToLiveSeconds } from "../../../../../definitions/backend/TimeToLiveSeconds";
import { Locales } from "../../../../../locales/locales";
import { setLocale } from "../../../../i18n";
import { CTA, CTAS, LocalizedCTAs } from "../../../../types/LocalizedCTAs";
import {
  ctasFromLocalizedCTAs,
  getMessageCTAs,
  getRemoteLocale,
  getServiceCTAs,
  handleCtaAction,
  localizedCTAsFromFrontMatter,
  removeCTAsFromMarkdown,
  testable
} from "../ctas";
import * as ANALYTICS from "../../analytics";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import { ServiceMetadata } from "../../../../../definitions/services/ServiceMetadata";

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

const mockAnalytics = jest.fn();

// test "it" as default language
beforeAll(() => setLocale("it" as Locales));
beforeEach(() => {
  jest
    .spyOn(ANALYTICS, "trackCTAFrontMatterDecodingError")
    .mockImplementation((_reason, _serviceId) =>
      mockAnalytics(_reason, _serviceId)
    );
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

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

describe("getMessageCTAs", () => {
  const serviceId = "01JQ945QT9DHQ90GD3FJSAZKJN" as ServiceId;
  const test2CTA = (
    maybeCTAS: CTAS | undefined,
    text1: string,
    action1: string,
    text2: string,
    action2: string
  ) => {
    expect(mockAnalytics.mock.calls.length).toBe(0);
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
  it("should have 2 valid CTA", () => {
    const maybeCTAs = getMessageCTAs(
      messageWithContent.content.markdown,
      serviceId
    );
    test2CTA(
      maybeCTAs,
      "premi",
      "ioit://PROFILE_MAIN",
      "premi2",
      "ioit://PROFILE_MAIN2"
    );
    setLocale("en" as Locales);
    const maybeCTAsEn = getMessageCTAs(
      messageWithContent.content.markdown,
      serviceId
    );
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
    const maybeCTAs = getMessageCTAs(
      messageWithContent.content.markdown,
      serviceId
    );
    test2CTA(
      maybeCTAs,
      "premi",
      "ioit://PROFILE_MAIN",
      "premi2",
      "ioit://PROFILE_MAIN2"
    );
    setLocale("it" as Locales); // restore default
  });

  it("should not have valid CTA (action's protocol is malformed)", () => {
    const CTA_1 = `---
it:
    cta_1:
        text: "premi"
        action: "io://PROFILE_MAIN"
--- 
some noise`;

    const maybeCTA = getMessageCTAs(CTA_1, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "The first CTA does not contain a supported action"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(maybeCTA).toBeUndefined();
  });

  it("should not have a CTA, when the input does not contain a front matter at all", () => {
    const maybeCTA = getMessageCTAs("nothing of nothing", serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(maybeCTA).toBe(undefined);
  });

  it("should not have a valid CTA, invalid content format", () => {
    const NO_CTA = `---
it:
    act_1:
        txet: "premi"
        aa: "ioit://PROFILE_MAIN"
--- 
some noise`;
    const maybeCTA = getMessageCTAs(NO_CTA, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "A failure occoured while decoding from Localized CTAS to specific CTAs"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(maybeCTA).toBeUndefined();
  });
});

describe("removeCTAsFromMarkdown", () => {
  const serviceId = "01JQ943CGG15SZF926E9NWJDT6" as ServiceId;
  it("should be the same (right either)", async () => {
    const markdown = "simple text";
    const cleaned = removeCTAsFromMarkdown(
      markdown as MessageBodyMarkdown,
      serviceId
    );
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(cleaned).toEqual(E.right(markdown));
  });

  it("should be cleaned (right either)", async () => {
    const withCTA = `---
it:
    cta_1:
        text: "premi"
        action: "io://PROFILE_MAIN"
--- 
some noise`;
    const cleaned = removeCTAsFromMarkdown(withCTA, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(cleaned).toEqual(E.right("some noise"));
  });

  it("should be cleaned (extended version, right either)", async () => {
    const cleaned = removeCTAsFromMarkdown(CTA_2, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(cleaned).toEqual(E.right(messageBody));
  });

  it("should return empty string for empty string input (right either)", () => {
    const input = "";
    const markdown = removeCTAsFromMarkdown(input, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(markdown).toEqual(E.right(""));
  });
  it("should return the markdown for a proper formatted message (with front matter and body, right either)", () => {
    const input =
      "---\nit:\n cta_1:\n  text: Il testo\n  action: ioit://messages\nen:\n cta_1:\n  text: The text\n  action: ioit//messages\n---\nThis is the message body";
    const markdown = removeCTAsFromMarkdown(input, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(markdown).toEqual(E.right("This is the message body"));
  });
  it("should return input string for invalid front matter (left either)", () => {
    const input =
      "---\nit:\n cta_1:\n  text: Il testo  action: ioit://messages\nen:\n cta_1:\n  text: The text\n  action: ioit//messages\n---\nThis is the message body";
    const markdown = removeCTAsFromMarkdown(input, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "A failure occourred while parsing or extracting body from input with front matter"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(markdown).toEqual(E.left(input));
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

describe("getCTAsIfValid", () => {
  const serviceId = "01JQ949EVMK5YV1ABA5J2NA0G8" as ServiceId;
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
    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      validCTAs,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
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

    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      validCTA1,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
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

    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      validCTAs,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "A failure occoured while decoding from Localized CTAS to specific CTAs"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
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

    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      validCTAs,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "The first CTA does not contain a supported action"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);

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

    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      validCTAs,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "The second CTA does not contain a supported action"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(verifiedCTAOrUndefined).toEqual({
      cta_1: { action: "ioit://messages", text: "Testo CTA1" },
      cta_2: { action: "thisIsNotValid", text: "Testo CTA2" }
    });
  });
  it("should return undefined from invalid input string", () => {
    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      "invalidInputString",
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(verifiedCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined from undefined input string", () => {
    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      undefined,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
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

      const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
        validCTA1,
        serviceId
      );

      expect(mockAnalytics.mock.calls.length).toBe(0);
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

    const verifiedCTAOrUndefined = testable!.getCTAsIfValid(
      validCTA1,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "A failure occourred while parsing or extracting front matter"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(verifiedCTAOrUndefined).toBeUndefined();
  });
});

describe("areCTAsActionsValid", () => {
  const serviceId = "01JQ9DQ32A9KE9EF340GQ3Z500" as ServiceId;
  it("should return true if cta1 action is valid, with undefined cta2", () => {
    const ctas: CTAS = {
      cta_1: {
        action: "ioit://messages",
        text: "CTA1 text"
      }
    };

    const hasValidActions = testable!.areCTAsActionsValid(
      ctas,
      serviceId,
      undefined
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
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

    const hasValidActions = testable!.areCTAsActionsValid(
      ctas,
      serviceId,
      undefined
    );

    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "The second CTA does not contain a supported action"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
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

    const hasValidActions = testable!.areCTAsActionsValid(
      ctas,
      serviceId,
      undefined
    );

    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "The first CTA does not contain a supported action"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
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

    const hasValidActions = testable!.areCTAsActionsValid(
      ctas,
      serviceId,
      undefined
    );

    expect(mockAnalytics.mock.calls.length).toBe(2);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "The first CTA does not contain a supported action"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(mockAnalytics.mock.calls[1].length).toBe(2);
    expect(mockAnalytics.mock.calls[1][0]).toBe(
      "The second CTA does not contain a supported action"
    );
    expect(mockAnalytics.mock.calls[1][1]).toBe(serviceId);
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
  const inputData: ReadonlyArray<[string, boolean]> = [
    ["ioit://whatever", true],
    ["iOiT://whatever", true],
    ["IOIT://whatever", true],
    ["ioit://services/webview", false],
    ["iosso://https://relyingParty.url", true],
    ["iOsSo://https://relyingParty.url", true],
    ["IOSSO://https://relyingParty.url", true],
    ["iohandledlink://http://whateverHere", true],
    ["iohandledlink://https://whateverHere", true],
    ["iOhAnDlEdLiNk://https://whateverHere", true],
    ["IOHANDLEDLINK://https://whateverHere", true],
    ["iohandledlink://sms://whateverHere", true],
    ["iohandledlink://tel://whateverHere", true],
    ["iohandledlink://mailto://whateverHere", true],
    ["iohandledlink://copy://whateverHere", true],
    ["iohandledlink://whatever", false],
    ["https://www.google.com", false],
    ["https://google.com", false],
    ["http://www.google.com", false],
    ["http://google.com", false],
    ["invalid", false]
  ];
  inputData.forEach(tuple => {
    const [action, validity] = tuple;
    it(`should return '${validity}' for '${action}'`, () => {
      const cta: CTA = {
        action,
        text: "CTA text"
      };
      const isValid = testable!.isCtaActionValid(cta);

      expect(isValid).toBe(validity);
    });
  });
});

describe("localizedCTAsFromFrontMatter", () => {
  const serviceId = "01JQ94FCTE5CBTH8114PP8QMSA" as ServiceId;
  it("should return undefined if input is undefined", () => {
    const messageCTAOrUndefined = localizedCTAsFromFrontMatter(
      undefined,
      serviceId
    );
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined if input is not a frontmatter", () => {
    const input = "This is not a front matter";
    const messageCTAOrUndefined = localizedCTAsFromFrontMatter(
      input,
      serviceId
    );
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined if input is not properly formatted", () => {
    const input = `---it: cta_1: text: "The text" action: "ioit://messages"---`;
    const messageCTAOrUndefined = localizedCTAsFromFrontMatter(
      input,
      serviceId
    );
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return undefined if input has invalid sequences (unclosed string)", () => {
    const input = `---\nit:\n cta_1:\n  text: "The text"\n  action: "ioit://messages\n---`;
    const messageCTAOrUndefined = localizedCTAsFromFrontMatter(
      input,
      serviceId
    );
    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "A failure occourred while parsing or extracting front matter"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(messageCTAOrUndefined).toBeUndefined();
  });
  it("should return a LocalizedCTAs instance if input is properly formatted", () => {
    const input = `---\nit:\n cta_1:\n  text: "The text"\n  action: "ioit://messages"\n---`;
    const messageCTAOrUndefined = localizedCTAsFromFrontMatter(
      input,
      serviceId
    );
    expect(mockAnalytics.mock.calls.length).toBe(0);
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

describe("ctasFromLocalizedCTAs", () => {
  const serviceId = "01JQ94ST1YFC2F395KYZ2XJG8Z" as ServiceId;
  it("should return undefined if input is undefined", () => {
    const ctas = ctasFromLocalizedCTAs(undefined, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(0);
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
      const messageCTA = invalidMessageCTA as LocalizedCTAs;
      const ctas = ctasFromLocalizedCTAs(messageCTA, serviceId);
      expect(mockAnalytics.mock.calls.length).toBe(1);
      expect(mockAnalytics.mock.calls[0].length).toBe(2);
      expect(mockAnalytics.mock.calls[0][0]).toBe(
        "A failure occoured while decoding from Localized CTAS to specific CTAs"
      );
      expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
      expect(ctas).toBeUndefined();
    });
  });
  it("should return CTAS if input is correct", () => {
    const messageCTA: LocalizedCTAs = {
      it: {
        cta_1: {
          text: "The text",
          action: "ioit://messages"
        }
      }
    };
    const ctas = ctasFromLocalizedCTAs(messageCTA, serviceId);
    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(ctas).toEqual({
      cta_1: {
        text: "The text",
        action: "ioit://messages"
      }
    });
  });
});

describe("getServiceCTAs", () => {
  const serviceId = "01JQ94V8E5KHN1QNPETAJNAK62" as ServiceId;
  it("should return undefined if input is undefined", () => {
    const serviceCTA = getServiceCTAs(serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(serviceCTA).toBeUndefined();
  });
  it("should return undefined if input service has no cta", () => {
    const serviceMetadata = {} as ServiceMetadata;

    const serviceCTA = getServiceCTAs(serviceId, serviceMetadata);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(serviceCTA).toBeUndefined();
  });
  it("should return the CTA if input service has a properly formatted cta", () => {
    const serviceMetadata = {
      cta: `---\nit:\n cta_1:\n  action: "ioit://messages"\n  text: "CTA's text"\n---`
    } as ServiceMetadata;

    const serviceCTA = getServiceCTAs(serviceId, serviceMetadata);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(serviceCTA).toEqual({
      cta_1: {
        action: "ioit://messages",
        text: "CTA's text"
      }
    });
  });
});

describe("handleCtaAction", () => {
  const mockedLinkTo = jest.fn(); // (path: string) => undefined;
  const mockedFimsCallback = jest.fn(); // (label: string, url: string) => undefined;
  [
    "ioit://messages",
    "iOiT://messages",
    "IOIT://messages",
    "iosso://https://relyingParty.url/login",
    "iOsSo://https://relyingParty.url/login",
    "IOSSO://https://relyingParty.url/login",
    "iohandledlink://mailto:johnsmith@gmail.com",
    "iOhAnDlEdLiNk://mailto:johnsmith@gmail.com",
    "IOHANDLEDLINK://mailto:johnsmith@gmail.com",
    "ioit:/messages",
    "ioit:messages",
    "ioitmessages",
    "iosso:/https://relyingParty.url/login",
    "iosso:https://relyingParty.url/login",
    "iossohttps://relyingParty.url/login",
    "iohandledlink:/mailto:johnsmith@gmail.com",
    "iohandledlink:mailto:johnsmith@gmail.com",
    "iohandledlinkmailto:johnsmith@gmail.com",
    "https://www.google.com",
    "https://google.com",
    "http://www.google.com",
    "http://google.com",
    "clipboard://prova",
    "clipboard:prova",
    "sms://3331234567",
    "sms:3331234567",
    "tel://3331234567",
    "tel:3331234567",
    "mailto://johnsmith@gmail.com",
    "mailto:johnsmith@gmail.com",
    "copy://aValue",
    "copy:aValue"
    // eslint-disable-next-line sonarjs/cognitive-complexity
  ].forEach((anUri, index) => {
    const linkToCalled = index < 3;
    const fimsCalled = index > 2 && index < 6;
    const openUrlCalled = index > 5 && index < 9;
    it(`should call '${
      linkToCalled
        ? "linkTo"
        : fimsCalled
        ? "fimsCallback"
        : openUrlCalled
        ? "Linking.openUrl"
        : "nothing"
    }' when the CTA's action is ${anUri}`, () => {
      const spiedOnMockedOpenURL = jest
        .spyOn(Linking, "openURL")
        .mockImplementation(
          _anUrl => new Promise(resolve => resolve(undefined))
        );
      const cta: CTA = {
        action: anUri,
        text: "A text"
      };

      handleCtaAction(cta, mockedLinkTo, mockedFimsCallback);

      if (linkToCalled) {
        expect(mockedLinkTo).toHaveBeenCalledWith(anUri.substring(6));
      } else {
        expect(mockedLinkTo).not.toHaveBeenCalled();
      }

      if (fimsCalled) {
        expect(mockedFimsCallback).toHaveBeenCalledWith(cta.text, cta.action);
      } else {
        expect(mockedFimsCallback).not.toHaveBeenCalled();
      }

      if (openUrlCalled) {
        expect(spiedOnMockedOpenURL).toHaveBeenCalledWith(anUri.substring(16));
      } else {
        expect(spiedOnMockedOpenURL).not.toHaveBeenCalled();
      }
    });
  });
});

describe("containsFrontMatterHeader", () => {
  const serviceId = "01JQ94XH4M0PQ2QGDTNYJ1ASS7" as ServiceId;
  it("should return false for empty string (right either)", () => {
    const input = "";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for non front matter string (right either)", () => {
    const input = "it:\n cta_1:\n  text: The text";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for non opening front matter (right either)", () => {
    const input = "it:\n cta_1:\n  text: The text\n---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for non closing front matter (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for opening front matter without newline (right either)", () => {
    const input = "---it:\n cta_1:\n  text: The text\n---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for closing front matter without newline (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for proper front matter that has extra characters (on the same line) after closing (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---Something else";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for proper front matter that has extra space before opening (right either)", () => {
    const input = " ---\nit:\n cta_1:\n  text: The text\n---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for proper front matter that has extra space before closing (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n ---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return false for a front matter that has wrong opening (right either)", () => {
    const input = "...\nit:\n cta_1:\n  text: The text\n---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(false));
  });
  it("should return a left either if the library throws an exception", () => {
    jest.spyOn(FM, "test").mockImplementation(_input => {
      throw Error("An error");
    });
    const input = "---\nit:\n cta_1:\n  text: The text\n---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(1);
    expect(mockAnalytics.mock.calls[0].length).toBe(2);
    expect(mockAnalytics.mock.calls[0][0]).toBe(
      "A failure occoured while testing for front matter"
    );
    expect(mockAnalytics.mock.calls[0][1]).toBe(serviceId);
    expect(containsFrontMatter).toEqual(E.left(undefined));
    jest.restoreAllMocks();
  });
  it("should return true for proper front matter (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(true));
  });
  it("should return true for proper front matter with invalid yaml (right either)", () => {
    const input = "---\nit: cta_1: text: The text\n---";

    const containsFrontMatter = testable!.containsFrontMatterHeader(
      input,
      serviceId
    );

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(containsFrontMatter).toEqual(E.right(true));
  });
});

describe("extractBodyAfterFrontMatter", () => {
  const serviceId = "01JQ94YTF42SGK4WWMP7M4F6SX" as ServiceId;
  it("should return input string for non opening front matter (right either)", () => {
    const input = "it:\n cta_1:\n  text: The text\n---\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should return input string for non closing front matter (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should return input string for opening front matter without newline (right either)", () => {
    const input = "---it:\n cta_1:\n  text: The text\n---\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should return input string for closing front matter without newline (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text---\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should return input string for proper front matter that has extra characters (on the same line) after closing (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---This is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should return input string for proper front matter that has extra space before opening (right either)", () => {
    const input = " ---\nit:\n cta_1:\n  text: The text\n---\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should return input string for proper front matter that has extra space before closing (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n ---\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should return input string for a front matter that has wrong opening (right either)", () => {
    const input = "...\nit:\n cta_1:\n  text: The text\n---\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(input));
  });
  it("should extract body for valid front matter (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---\nThis is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right("This is the body"));
  });
  it("should extract empty body for valid front matter with no body (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---\n";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(""));
  });
  it("should extract empty body for valid front matter with no body and no newline (right either)", () => {
    const input = "---\nit:\n cta_1:\n  text: The text\n---";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(""));
  });
  it("should extract body for a string with no front matter (right either)", () => {
    const input = "This is the body";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right("This is the body"));
  });
  it("should extract empty body from an empty string (right either)", () => {
    const input = "";

    const body = testable!.extractBodyAfterFrontMatter(input, serviceId);

    expect(mockAnalytics.mock.calls.length).toBe(0);
    expect(body).toEqual(E.right(""));
  });
});
