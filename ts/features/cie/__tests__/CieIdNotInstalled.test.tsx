import { Linking, Platform } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import CieIdNotInstalled, {
  CIE_ID_ANDROID_COLL_LINK,
  CIE_ID_ANDROID_LINK,
  CIE_ID_IOS_LINK
} from "../components/CieIdNotInstalled";

const UAT_ENV_ENABLE_STATES = [true, false];

const mockPopToTop = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    popToTop: mockPopToTop
  })
}));

describe(CieIdNotInstalled, () => {
  afterEach(jest.clearAllMocks);
  it("Should match the snapshot", () => {
    const component = render(<CieIdNotInstalled isUat={false} />);

    expect(component).toMatchSnapshot();
  });

  describe("Behavior on iOS", () => {
    UAT_ENV_ENABLE_STATES.forEach(uatState => {
      it("Should open CIE_ID_IOS_LINK", () => {
        const { getByTestId } = render(<CieIdNotInstalled isUat={uatState} />);

        const openStore = getByTestId("cie-id-not-installed-open-store");
        fireEvent.press(openStore);

        expect(jest.spyOn(Linking, "openURL")).toHaveBeenCalledWith(
          CIE_ID_IOS_LINK
        );
        expect(mockPopToTop).not.toHaveBeenCalled();
      });
    });
  });
  describe("Behavior on Android", () => {
    it("Should open CIE_ID_ANDROID_LINK", () => {
      jest.spyOn(Platform, "select").mockReturnValue(CIE_ID_ANDROID_LINK);

      const { getByTestId } = render(<CieIdNotInstalled isUat={false} />);

      const openStore = getByTestId("cie-id-not-installed-open-store");
      fireEvent.press(openStore);

      expect(jest.spyOn(Linking, "openURL")).toHaveBeenCalledWith(
        CIE_ID_ANDROID_LINK
      );
      expect(mockPopToTop).not.toHaveBeenCalled();
    });
    it("Should open CIE_ID_ANDROID_COLL_LINK", () => {
      jest.spyOn(Platform, "select").mockReturnValue(CIE_ID_ANDROID_COLL_LINK);

      const { getByTestId } = render(<CieIdNotInstalled isUat />);

      const openStore = getByTestId("cie-id-not-installed-open-store");
      fireEvent.press(openStore);

      expect(jest.spyOn(Linking, "openURL")).toHaveBeenCalledWith(
        CIE_ID_ANDROID_COLL_LINK
      );
      expect(mockPopToTop).not.toHaveBeenCalled();
    });
  });
  UAT_ENV_ENABLE_STATES.forEach(uatState => {
    it("Should call popToTop", () => {
      const { getByTestId } = render(<CieIdNotInstalled isUat={uatState} />);

      const popToTop = getByTestId("cie-id-not-installed-pop-to-top");
      fireEvent.press(popToTop);

      expect(jest.spyOn(Linking, "openURL")).not.toHaveBeenCalled();
      expect(mockPopToTop).toHaveBeenCalledTimes(1);
    });
  });
});
