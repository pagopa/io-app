import * as E from "fp-ts/lib/Either";
import { UADonationWebViewMessage } from "../index";

const testCases: ReadonlyArray<
  [
    description: string,
    input: Record<string, unknown>,
    decodingSuccess: boolean
  ]
> = [
  ["not valid kind", { kind: "xxx" }, false],
  ["missing payload", { kind: "webUrl" }, false],
  ["invalid payload", { kind: "webUrl", payload: 123 }, false],
  ["valid payload", { kind: "webUrl", payload: "a web url" }, true],
  ["missing payload", { kind: "error" }, false],
  ["invalid payload", { kind: "error", payload: 123 }, false],
  ["valid payload", { kind: "webUrl", payload: "an error" }, true],
  ["missing payload", { kind: "payment" }, false],
  ["invalid payload", { kind: "error", payload: 123 }, false],
  [
    "invalid payload",
    { kind: "error", payload: { nav: 123, cf: "xxx", amount: 123 } },
    false
  ],
  [
    "invalid payload (cf)",
    {
      kind: "payment",
      payload: { nav: "300001646752822108", cf: "xxx", amount: 123 }
    },
    false
  ],
  [
    "invalid payload (nav)",
    {
      kind: "payment",
      payload: { nav: "001646752822108", cf: "11111111111", amount: 123 }
    },
    false
  ],
  [
    "invalid payload (amount)",
    {
      kind: "payment",
      payload: { nav: "300001646752822108", cf: "11111111111", amount: "hello" }
    },
    false
  ],
  [
    "valid payload",
    {
      kind: "payment",
      payload: { nav: "300001646752822108", cf: "11111111111", amount: 123 }
    },
    true
  ]
];

describe("isAvailableBonusLoadingSelector selector", () => {
  test.each(testCases)(
    "%p: given %p as argument, is right %p",
    (_, input, expectedResult) => {
      const result = E.isRight(UADonationWebViewMessage.decode(input));
      expect(result).toEqual(expectedResult);
    }
  );
});
