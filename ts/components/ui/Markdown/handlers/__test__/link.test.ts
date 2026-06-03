import {
  deriveCustomHandledLink,
  isHttpLink,
  isHttpsLink,
  isIoInternalLink
} from "../link";

const loadingCases: ReadonlyArray<
  [input: string, expectedResult: ReturnType<typeof deriveCustomHandledLink>]
> = [
  ["", undefined],
  ["some text", undefined],
  ["iohandledlink://noprotocol:somevalue", undefined],
  ["mailto:somevalue", undefined],
  ["iohandledlink://http://www.google.com", "http://www.google.com"],
  ["IOHANDLEDLINK://HTTP://WWW.GOOGLE.COM", "HTTP://WWW.GOOGLE.COM"],
  [
    "iohandledlink://iohandledLink://http://www.google.com",
    "http://www.google.com"
  ],
  ["iohandledlink://https://www.google.com", "https://www.google.com"],
  ["iohandledlink://copy:123text456", "copy:123text456"],
  ["iohandledlink://sms:123456", "sms:123456"],
  ["iohandledlink://tel:123456", "tel:123456"],
  [
    "iohandledlink://mailto:name.surname@email.com",
    "mailto:name.surname@email.com"
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

describe("isHttpLink", () => {
  ["http://", "hTtP://", "HTTP://"].forEach(protocol => {
    it(`should return true for '${protocol}'`, () => {
      const isHttp = isHttpLink(`${protocol}whatever`);
      expect(isHttp).toBe(true);
    });
  });
  [
    "http:/",
    "http:",
    "http",
    "https://",
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
      const isHttp = isHttpLink(`${protocol}whatever`);
      expect(isHttp).toBe(false);
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
