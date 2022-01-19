import { getType } from "typesafe-actions";
import { mvlPreferencesSetWarningForAttachments } from "../../actions";
import { initialState, mvlPreferencesReducer } from "../preferences";

describe("the `mvlPreferencesReducer`", () => {
  describe(`when ${getType(
    mvlPreferencesSetWarningForAttachments
  )} is received`, () => {
    describe("with payload `false`", () => {
      it("should set `showAlertForAttachments` to false", () => {
        expect(
          mvlPreferencesReducer(
            { ...initialState, showAlertForAttachments: true },
            mvlPreferencesSetWarningForAttachments(false)
          )
        ).toEqual({ ...initialState, showAlertForAttachments: false });
      });
    });

    describe("with payload `true`", () => {
      it("should set `showAlertForAttachments` to true", () => {
        expect(
          mvlPreferencesReducer(
            { ...initialState, showAlertForAttachments: false },
            mvlPreferencesSetWarningForAttachments(true)
          )
        ).toEqual({ ...initialState, showAlertForAttachments: true });
      });
    });
  });
});
