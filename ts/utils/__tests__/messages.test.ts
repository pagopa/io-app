import { Option } from "fp-ts/lib/Option";
import { CreatedMessageWithContent } from "../../../definitions/backend/CreatedMessageWithContent";
import { FiscalCode } from "../../../definitions/backend/FiscalCode";
import { MessageBodyMarkdown } from "../../../definitions/backend/MessageBodyMarkdown";
import { MessageContent } from "../../../definitions/backend/MessageContent";
import { CTA, CTAS } from "../../types/MessageCTA";
import { cleanMarkdownFromCTAs, getCTA, isCtaActionValid } from "../messages";

const messageBody = `### this is a message

this is a body`;

const CTA_2 =
  `---
it:
    cta_1: 
        text: "premi"
        action: "io://PROFILE_MAIN"
    cta_2: 
        text: "premi2"
        action: "io://PROFILE_MAIN2"
en:
    cta_1: 
        text: "go1"
        action: "io://PROFILE_MAIN"
    cta_2: 
        text: "go2"
        action: "io://PROFILE_MAIN2"
---
` + messageBody;

const messageWithContent = {
  created_at: new Date(),
  fiscal_code: "RSSMRA83A12H501D" as FiscalCode,
  id: "93726BD8-D29C-48F2-AE6D-2F",
  sender_service_id: "dev-service_0",
  time_to_live: 3600,
  content: {
    subject: "Subject - test 1",
    markdown: CTA_2,
    due_date: new Date(),
    payment_data: {
      notice_number: "012345678912345678",
      amount: 406,
      invalid_after_due_date: false
    }
  } as MessageContent
} as CreatedMessageWithContent;

describe("getCTA", () => {
  it("should have 2 valid CTA", () => {
    const maybeCTAs = getCTA(messageWithContent, "it");
    test2CTA(
      maybeCTAs,
      "premi",
      "io://PROFILE_MAIN",
      "premi2",
      "io://PROFILE_MAIN2"
    );
    const maybeCTAsEn = getCTA(messageWithContent, "en");
    test2CTA(
      maybeCTAsEn,
      "go1",
      "io://PROFILE_MAIN",
      "go2",
      "io://PROFILE_MAIN2"
    );
  });

  it("should have 1 valid CTA", () => {
    const CTA_1 = `---
it:
    cta_1:
        text: "premi"
        action: "io://PROFILE_MAIN"
--- 
some noise`;

    const maybeCTA = getCTA(
      {
        ...messageWithContent,
        content: {
          ...messageWithContent.content,
          markdown: CTA_1 as MessageBodyMarkdown
        }
      },
      "it"
    );
    expect(maybeCTA.isSome()).toBeTruthy();
    if (maybeCTA.isSome()) {
      const ctas = maybeCTA.value;
      expect(ctas.cta_1).toBeDefined();
      expect(ctas.cta_2).not.toBeDefined();
    }

    const maybeCTAEn = getCTA(
      {
        ...messageWithContent,
        content: {
          ...messageWithContent.content,
          markdown: CTA_1 as MessageBodyMarkdown
        }
      },
      "en"
    );
    // this is because it fallbacks on the next locale supported (it in this case)
    expect(maybeCTAEn.isSome()).toBeTruthy();
  });

  it("should not have a valid CTA", () => {
    const maybeCTA = getCTA(
      {
        ...messageWithContent,
        content: {
          ...messageWithContent.content,
          markdown: "nothing of nothing" as MessageBodyMarkdown
        }
      },
      "it"
    );
    expect(maybeCTA.isNone()).toBeTruthy();
  });

  it("should not have a valid CTA", () => {
    const NO_CTA = `---
it:
    act_1:
        txet: "premi"
        aa: "io://PROFILE_MAIN"
--- 
some noise`;
    const maybeCTA = getCTA(
      {
        ...messageWithContent,
        content: {
          ...messageWithContent.content,
          markdown: NO_CTA as MessageBodyMarkdown
        }
      },
      "it"
    );
    expect(maybeCTA.isNone()).toBeTruthy();
  });
});

const test2CTA = (
  maybeCTAS: Option<CTAS>,
  text1: string,
  action1: string,
  text2: string,
  action2: string
) => {
  expect(maybeCTAS.isSome()).toBeTruthy();
  if (maybeCTAS.isSome()) {
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
    const isValid = await isCtaActionValid(valid);
    expect(isValid).toBeTruthy();
  });

  it("should be not valid (wrong protocol)", async () => {
    const invalidProtocol: CTA = {
      text: "dummy",
      action: "iosit://PROFILE_MAIN"
    };
    const isValid = await isCtaActionValid(invalidProtocol);
    expect(isValid).toBeFalsy();
  });

  it("should be not valid (wrong route)", async () => {
    const invalidRoute: CTA = { text: "dummy", action: "iosit://WRONG_ROUTE" };
    const isValid = await isCtaActionValid(invalidRoute);
    expect(isValid).toBeFalsy();
  });

  it("should be a valid RN Linking", async () => {
    const phoneCtaValid: CTA = {
      text: "dummy",
      action: "iohandledlink://tel://3471615647"
    };
    const isValid = await isCtaActionValid(phoneCtaValid);
    expect(isValid).toBeTruthy();
  });

  it("should be a valid RN Linking (web)", async () => {
    const webCtaValid: CTA = {
      text: "dummy",
      action: "iohandledlink://https://www.google.it"
    };
    const isValid = await isCtaActionValid(webCtaValid);
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
