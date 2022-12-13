import * as E from "fp-ts/lib/Either";
import { deriveCustomHandledLink } from "../link";

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

describe("deriveCustomHandledLink", () => {
  test.each(loadingCases)(
    "given %p as argument, returns %p",
    (firstArg, expectedResult) => {
      const result = deriveCustomHandledLink(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});
