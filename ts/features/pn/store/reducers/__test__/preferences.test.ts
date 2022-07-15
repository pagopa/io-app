import { getType } from "typesafe-actions";
import { pnPreferencesSetWarningForMessageOpening } from "../../actions";
import { initialState, pnPreferencesReducer } from "../preferences";

describe("the `pnPreferencesReducer`", () => {
  describe(`when ${getType(
    pnPreferencesSetWarningForMessageOpening
  )} is received`, () => {
    describe("with payload `false`", () => {
      it("should set `showAlertForMessageOpening` to false", () => {
        expect(
          pnPreferencesReducer(
            { ...initialState, showAlertForMessageOpening: true },
            pnPreferencesSetWarningForMessageOpening(false)
          )
        ).toEqual({ ...initialState, showAlertForMessageOpening: false });
      });
    });

    describe("with payload `true`", () => {
      it("should set `showAlertForMessageOpening` to true", () => {
        expect(
          pnPreferencesReducer(
            { ...initialState, showAlertForMessageOpening: false },
            pnPreferencesSetWarningForMessageOpening(true)
          )
        ).toEqual({ ...initialState, showAlertForMessageOpening: true });
      });
    });
  });
});
