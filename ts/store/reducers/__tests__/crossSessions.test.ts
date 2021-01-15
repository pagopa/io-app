import { FiscalCode } from "italia-ts-commons/lib/strings";
import sha from "sha.js";
import { appReducer } from "../index";
import { GlobalState } from "../types";
import { setProfileHashedFiscalCode } from "../../actions/crossSessions";
import {
  hashedProfileFiscalCodeSelector,
  isDifferentFiscalCode
} from "../crossSessions";

jest.mock("@react-native-community/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

const hash = (value: string): string =>
  sha("sha256").update(value).digest("hex");
const fiscalCode = "TAMMRA80A41H501Y" as FiscalCode;
const hashedFiscalCode = hash(fiscalCode);

describe("cross sessions status reducer/selectors", () => {
  it("should be the hash value of fiscal code", () => {
    const globalState: GlobalState = appReducer(
      undefined,
      setProfileHashedFiscalCode(fiscalCode)
    );
    expect(hashedProfileFiscalCodeSelector(globalState)).toEqual(
      hashedFiscalCode
    );
  });

  it("should be different from hash value of fiscal code", () => {
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
    expect(isDifferentFiscalCode(fiscalCode)(globalState)).toBeFalsy();
    // empty state
    expect(
      isDifferentFiscalCode(fiscalCode)({
        ...globalState,
        crossSessions: { hashedFiscalCode: undefined }
      })
    ).toBeFalsy();
  });
});
