import { testableGetFinishAndOutcome } from "../PayWebViewModal";

const loadingCases: ReadonlyArray<[
  url: string,
  finishPathName: string,
  outcomeQueryparamName: string,
  expectedResult: [isFinish: boolean, outcomeCode: string | undefined]
]> = [
  ["http://mydomain.com/path", "/finish/path", "empty", [false, undefined]],
  [
    "http://mydomain.com/finish/path",
    "/finish/path",
    "empty",
    [true, undefined]
  ],
  [
    "http://mydomain.com/finish/path?empt=1234",
    "/finish/path2",
    "empty",
    [false, undefined]
  ],
  [
    "http://mydomain.com/finish/path?mycode=12345",
    "/finish/path",
    "empty",
    [true, undefined]
  ],
  [
    "http://mydomain.com/finish/path?mycode=12345",
    "/finish/path",
    "mycode",
    [true, "12345"]
  ],
  [
    "http://mydomain.com/fiNIsh/Path?MyCode=12345",
    "/finish/path",
    "mycode",
    [true, "12345"]
  ]
];

describe("getFinishAndOutcome", () => {
  test.each(loadingCases)(
    "given %p as url, %p as finishPathName, %p as outcomeQueryparamName, returns %p",
    (url, finishPathName, outcomeQueryparamName, expectedResult) => {
      const result = testableGetFinishAndOutcome!(
        url,
        finishPathName,
        outcomeQueryparamName
      );
      expect(result).toEqual(expectedResult);
    }
  );
});
