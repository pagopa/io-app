import { FiscalCode } from "@pagopa/ts-commons/lib/strings";
import sha from "sha.js";
import { setProfileHashedFiscalCode } from "../../actions/crossSessions";
import {
  hashedProfileFiscalCodeSelector,
  isDifferentFiscalCodeSelector
} from "../crossSessions";
import { appReducer } from "../index";
import { GlobalState } from "../types";

jest.mock("@react-native-async-storage/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

const hash = (value: string): string =>
  sha("sha256").update(value).digest("hex");
const fiscalCode = "TAMMRA80A41H501Y" as FiscalCode;
const fiscalCode2 = "TAMMRA80A41H501X" as FiscalCode;
const hashedFiscalCode = hash(fiscalCode);

describe("cross sessions status reducer/selectors", () => {
  it("should be the hashed value of the fiscal code", () => {
    const globalState: GlobalState = appReducer(
      undefined,
      setProfileHashedFiscalCode(fiscalCode)
    );
    expect(hashedProfileFiscalCodeSelector(globalState)).toEqual(
      hashedFiscalCode
    );
  });

  it("should be different from the hashed value of the fiscal code", () => {
    const globalState: GlobalState = appReducer(
      undefined,
      setProfileHashedFiscalCode("TAMMRA80A41H501X" as FiscalCode)
    );
    expect(hashedProfileFiscalCodeSelector(globalState)).not.toEqual(
      hashedFiscalCode
    );
  });

  it("should not be different", () => {
    const globalState: GlobalState = appReducer(
      undefined,
      setProfileHashedFiscalCode(fiscalCode)
    );
    expect(isDifferentFiscalCodeSelector(globalState, fiscalCode)).toBe(false);
    // empty state
    expect(
      isDifferentFiscalCodeSelector(
        {
          ...globalState,
          crossSessions: { hashedFiscalCode: undefined }
        },
        fiscalCode
      )
    ).toBeUndefined();
  });

  it("should be different", () => {
    const globalState: GlobalState = appReducer(
      undefined,
      setProfileHashedFiscalCode(fiscalCode)
    );
    expect(isDifferentFiscalCodeSelector(globalState, fiscalCode2)).toBe(true);
  });
});
