import {
  enrichFimsDestinationUrl,
  isFIMSLink,
  removeFIMSPrefixFromUrl
} from "..";

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

describe("enrichFimsDestinationUrl", () => {
  const allowedUrl = "https://trusted.test/callback";
  const deviceId = "mixpanel-device-id";

  it.each([
    {
      name: "the destination matches the allowlist",
      destinationUrl: allowedUrl,
      trackingEnrichedUrls: [allowedUrl],
      expectedUrl: `${allowedUrl}?mixpanelId=${deviceId}`
    },
    {
      name: "the destination contains query parameters and a fragment",
      destinationUrl: `${allowedUrl}?token=one-shot#result`,
      trackingEnrichedUrls: [allowedUrl],
      expectedUrl: `${allowedUrl}?token=one-shot&mixpanelId=${deviceId}#result`
    },
    {
      name: "the allowlist uses a different case and trailing slash",
      destinationUrl: "https://TRUSTED.TEST/CALLBACK?token=one-shot",
      trackingEnrichedUrls: ["https://trusted.test/callback/"],
      expectedUrl:
        "https://TRUSTED.TEST/CALLBACK?token=one-shot&mixpanelId=mixpanel-device-id"
    },
    {
      name: "the allowlist URL contains query parameters and a fragment",
      destinationUrl: allowedUrl,
      trackingEnrichedUrls: [`${allowedUrl}?configuration=value#section`],
      expectedUrl: `${allowedUrl}?mixpanelId=${deviceId}`
    }
  ])(
    "enriches the URL when $name",
    ({ destinationUrl, trackingEnrichedUrls, expectedUrl }) => {
      expect(
        enrichFimsDestinationUrl(destinationUrl, trackingEnrichedUrls, deviceId)
      ).toBe(expectedUrl);
    }
  );

  it.each([
    "https://trusted.test/another-path",
    `https://attacker.test/${allowedUrl}`,
    `https://attacker.test/?redirect=${allowedUrl}`,
    `https://attacker.test/#${allowedUrl}`,
    "not-a-url"
  ])("returns an unchanged URL when it is not allowed: %s", destinationUrl => {
    expect(
      enrichFimsDestinationUrl(destinationUrl, [allowedUrl], deviceId)
    ).toBe(destinationUrl);
  });

  it.each([
    {
      name: "the allowlist is empty",
      trackingEnrichedUrls: [],
      expectedUrl: allowedUrl
    },
    {
      name: "the only allowlist URL does not match",
      trackingEnrichedUrls: ["https://trusted.test/another-path"],
      expectedUrl: allowedUrl
    },
    {
      name: "only the second allowlist URL matches",
      trackingEnrichedUrls: ["https://trusted.test/another-path", allowedUrl],
      expectedUrl: `${allowedUrl}?mixpanelId=${deviceId}`
    }
  ])("handles $name", ({ trackingEnrichedUrls, expectedUrl }) => {
    expect(
      enrichFimsDestinationUrl(allowedUrl, trackingEnrichedUrls, deviceId)
    ).toBe(expectedUrl);
  });
});
