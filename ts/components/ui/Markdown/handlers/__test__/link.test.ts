import { left, right } from "fp-ts/lib/Either";
import { deriveCustomHandledLink } from "../link";

const loadingCases: ReadonlyArray<
  [input: string, expectedResult: ReturnType<typeof deriveCustomHandledLink>]
> = [
  ["", left(new Error(`"" is not recognized as a valid handled link`))],
  [
    "some text",
    left(new Error(`"some text" is not recognized as a valid handled link`))
  ],
  [
    "iohandledlink://noprotocol:somevalue",
    left(
      new Error(
        `"iohandledlink://noprotocol:somevalue" is not recognized as a valid handled link`
      )
    )
  ],
  [
    "iohandledlink://http://www.google.com",
    right({
      schema: "http",
      url: "http://www.google.com",
      value: "//www.google.com"
    })
  ],
  [
    "iohandledlink://https://www.google.com",
    right({
      schema: "https",
      url: "https://www.google.com",
      value: "//www.google.com"
    })
  ],
  [
    "iohandledlink://copy:123text456",
    right({
      schema: "copy",
      url: "copy:123text456",
      value: "123text456"
    })
  ],
  [
    "iohandledlink://sms:123456",
    right({
      schema: "sms",
      url: "sms:123456",
      value: "123456"
    })
  ],
  [
    "iohandledlink://tel:123456",
    right({
      schema: "tel",
      url: "tel:123456",
      value: "123456"
    })
  ],
  [
    "iohandledlink://mailto:name.surname@email.com",
    right({
      schema: "mailto",
      url: "mailto:name.surname@email.com",
      value: "name.surname@email.com"
    })
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
