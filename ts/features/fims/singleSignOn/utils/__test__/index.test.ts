import { isFIMSLink, removeFIMSPrefixFromUrl } from "..";

describe("index", () => {
  describe("removeFIMSPrefixFromUrl", () => {
    const fimsCases: ReadonlyArray<
      [
        input: string,
        expectedResult: ReturnType<typeof removeFIMSPrefixFromUrl>
      ]
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
    test.each(fimsCases)(
      "given %p as argument, returns %p",
      (firstArg, expectedResult) => {
        const result = removeFIMSPrefixFromUrl(firstArg);
        expect(result).toEqual(expectedResult);
      }
    );
  });
});

describe("isIoFIMSLink", () => {
  ["iosso://", "iOsSo://", "IOSSO://"].forEach(protocol => {
    it(`should return true for '${protocol}'`, () => {
      const isIOFIMSLink = isFIMSLink(`${protocol}whatever`);
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
      const isIOFIMSLink = isFIMSLink(`${protocol}whatever`);
      expect(isIOFIMSLink).toBe(false);
    });
  });
});
