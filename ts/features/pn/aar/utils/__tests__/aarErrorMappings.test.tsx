import * as GENERIC_ERROR from "../../components/errors/SendAARErrorComponent";
import { getSendAarErrorComponent, testable } from "../aarErrorMappings";

const errorMap = testable.aarErrorMap!;
describe("aarErrorMappings", () => {
  const genericErrorSpy = jest
    .spyOn(GENERIC_ERROR, "SendAarGenericErrorComponent")
    .mockImplementation(() => <></>);
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getSendAarErrorComponent", () => {
    describe("Generic Error Component Cases", () => {
      test.each([
        {
          title:
            "should return generic error component when errors is undefined",
          errors: undefined
        },
        {
          title:
            "should return generic error component when errors is an empty array",
          errors: []
        },
        {
          title:
            "should return generic error component when called with a single unknown error code",
          errors: [{ code: "UNKNOWN_ERROR_CODE" }]
        },
        {
          title:
            "should return generic error component when called with multiple unknown error codes",
          errors: [
            { code: "UNKNOWN_ERROR_CODE_1" },
            { code: "UNKNOWN_ERROR_CODE_2" }
          ]
        }
      ])("$title", ({ errors }) => {
        const component = getSendAarErrorComponent(errors);
        expect(component).toBeDefined();
        expect(component).toBe(genericErrorSpy);
      });
    });

    errorMap.forEach((component, errorCode) => {
      it(`should return the correct component for error code ${errorCode}`, () => {
        const result = getSendAarErrorComponent([{ code: errorCode }]);
        expect(result).toBeDefined();
        expect(result).toBe(component);
      });
      it(`should return the first matching component when
         multiple error codes are provided before ${errorCode}`, () => {
        const precedingUnknownErrors = [
          { code: "UNKNOWN_ERROR_CODE_1" },
          { code: "UNKNOWN_ERROR_CODE_2" }
        ];
        const result = getSendAarErrorComponent([
          ...precedingUnknownErrors,
          { code: errorCode }
        ]);
        expect(result).toBeDefined();
        expect(result).toBe(component);
      });
      it(`should return the first matching component when multiple valid error codes are provided after ${errorCode}`, () => {
        const followingKnownErrors = Array.from(errorMap.keys())
          .filter(code => code !== errorCode)
          .map(code => ({ code }));
        const result = getSendAarErrorComponent([
          { code: errorCode },
          ...followingKnownErrors
        ]);
        expect(result).toBeDefined();
        expect(result).toBe(component);
      });
    });
  });
});
