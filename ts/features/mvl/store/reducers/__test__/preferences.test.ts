import { getType } from "typesafe-actions";
import { mvlPreferencesDontAskForAttachments } from "../../actions";
import { initialState, mvlPreferencesReducer } from "../preferences";

describe("the `mvlPreferencesReducer`", () => {
  describe(`when ${getType(
    mvlPreferencesDontAskForAttachments
  )} is received`, () => {
    it("should set `showAlertForAttachments` to false", () => {
      expect(
        mvlPreferencesReducer(
          initialState,
          mvlPreferencesDontAskForAttachments()
        )
      ).toEqual({ ...initialState, showAlertForAttachments: false });
    });
  });
});
