import * as O from "fp-ts/lib/Option";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { lollipopKeyTagSave } from "../../actions/lollipop";
import lollipopReducer, { lollipopSelector } from "./../lollipop";

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

const globalState = appReducer(undefined, applicationChangeState("active"));

describe("Lollipop state", () => {
  it("Test selectors and reducers", () => {
    const lollipopState = lollipopSelector(globalState);
    expect(lollipopState.keyTag).toBe(O.none);
    const newLollipopState = lollipopReducer(
      lollipopState,
      lollipopKeyTagSave({ keyTag: "newKeyTag" })
    );
    expect(newLollipopState.keyTag).toStrictEqual(O.some("newKeyTag"));
  });
});
