import * as E from "fp-ts/lib/Either";
import {
  deriveCustomHandledLink,
  isHttpsLink,
  isIoFIMSLink,
  isIoInternalLink,
  removeFIMSPrefixFromUrl
} from "../link";

const loadingCases: ReadonlyArray<
  [input: string, expectedResult: ReturnType<typeof deriveCustomHandledLink>]
> = [
  ["", E.left(new Error(`"" is not recognized as a valid handled link`))],
  [
    "some text",
    E.left(new Error(`"some text" is not recognized as a valid handled link`))
  ],
  [
    "iohandledlink://noprotocol:somevalue",
    E.left(
      new Error(
        `"iohandledlink://noprotocol:somevalue" is not recognized as a valid handled link`
      )
    )
  ],
  [
    "iohandledlink://http://www.google.com",
    E.right({
      schema: "http",
      url: "http://www.google.com",
      value: "//www.google.com"
    })
  ],
  [
    "iohandledlink://https://www.google.com",
    E.right({
      schema: "https",
      url: "https://www.google.com",
      value: "//www.google.com"
    })
  ],
  [
    "iohandledlink://copy:123text456",
    E.right({
      schema: "copy",
      url: "copy:123text456",
      value: "123text456"
    })
  ],
  [
    "iohandledlink://sms:123456",
    E.right({
      schema: "sms",
      url: "sms:123456",
      value: "123456"
    })
  ],
  [
    "iohandledlink://tel:123456",
    E.right({
      schema: "tel",
      url: "tel:123456",
      value: "123456"
    })
  ],
  [
    "iohandledlink://mailto:name.surname@email.com",
    E.right({
      schema: "mailto",
      url: "mailto:name.surname@email.com",
      value: "name.surname@email.com"
    })
  ]
];

const fimsCases: ReadonlyArray<
  [input: string, expectedResult: ReturnType<typeof removeFIMSPrefixFromUrl>]
> = [
  [
    "iosso://https://italia.io/main/messages?messageId=4&serviceId=5",
    "https://italia.io/main/messages?messageId=4&serviceId=5"
  ],
  [
    "iOsSo://https://italia.io/main/messages?messageId=4&serviceId=5",
    "https://italia.io/main/messages?messageId=4&serviceId=5"
  ]
];

describe("deriveCustomHandledLink", () => {
  test.each(loadingCases)(
    "given %p as argument, returns %p",
    (firstArg, expectedResult) => {
      const result = deriveCustomHandledLink(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});

describe("removeFIMSPrefixFromUrl", () => {
  test.each(fimsCases)(
    "given %p as argument, returns %p",
    (firstArg, expectedResult) => {
      const result = removeFIMSPrefixFromUrl(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});

describe("isHttpsLink", () => {
  ["https://", "hTtPs://", "HTTPS://"].forEach(protocol => {
    it(`should return true for '${protocol}'`, () => {
      const isHttps = isHttpsLink(`${protocol}whatever`);
      expect(isHttps).toBe(true);
    });
  });
  [
    "https:/",
    "https:",
    "https",
    "http://",
    "ioit://",
    "iohandledlink://",
    "iosso://",
    "clipboard://",
    "clipboard:",
    "sms://",
    "sms:",
    "tel://",
    "tel:",
    "mailto://",
    "mailto:",
    "copy://",
    "copy:"
  ].forEach(protocol => {
    it(`should return false for '${protocol}'`, () => {
      const isHttps = isHttpsLink(`${protocol}whatever`);
      expect(isHttps).toBe(false);
    });
  });
});

describe("isIoFIMSLink", () => {
  ["iosso://", "iOsSo://", "IOSSO://"].forEach(protocol => {
    it(`should return true for '${protocol}'`, () => {
      const isIOFIMSLink = isIoFIMSLink(`${protocol}whatever`);
      expect(isIOFIMSLink).toBe(true);
    });
  });
  [
    "iosso:/",
    "iosso:",
    "iosso",
    "https://",
    "http://",
    "ioit://",
    "iohandledlink://",
    "clipboard://",
    "clipboard:",
    "sms://",
    "sms:",
    "tel://",
    "tel:",
    "mailto://",
    "mailto:",
    "copy://",
    "copy:"
  ].forEach(protocol => {
    it(`should return false for '${protocol}'`, () => {
      const isIOFIMSLink = isIoFIMSLink(`${protocol}whatever`);
      expect(isIOFIMSLink).toBe(false);
    });
  });
});

describe("isIoInternalLink", () => {
  ["ioit://", "iOiT://", "IOIT://"].forEach(protocol => {
    it(`should return true for '${protocol}'`, () => {
      const isIOLink = isIoInternalLink(`${protocol}whatever`);
      expect(isIOLink).toBe(true);
    });
  });
  [
    "ioit:/",
    "ioit:",
    "ioit",
    "https://",
    "http://",
    "iosso://",
    "iohandledlink://",
    "clipboard://",
    "clipboard:",
    "sms://",
    "sms:",
    "tel://",
    "tel:",
    "mailto://",
    "mailto:",
    "copy://",
    "copy:"
  ].forEach(protocol => {
    it(`should return false for '${protocol}'`, () => {
      const isIOLink = isIoInternalLink(`${protocol}whatever`);
      expect(isIOLink).toBe(false);
    });
  });
});
