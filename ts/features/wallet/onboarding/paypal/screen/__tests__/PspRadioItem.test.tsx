import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { PspRadioItem } from "../../components/PspRadioItem";
import { privacyUrl } from "../../../../../../config";
import { IOPayPalPsp } from "../../types";

const mockPresent = jest.fn();
jest.mock("@gorhom/bottom-sheet", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const react = require("react-native");
  return {
    __esModule: true,
    BottomSheetModal: react.Modal,
    useBottomSheetModal: () => ({
      present: mockPresent,
      dismissAll: mockPresent
    })
  };
});

const payPalPsp: IOPayPalPsp = {
  id: "1",
  logoUrl: "https://paytipper.com/wp-content/uploads/2021/02/logo.png",
  name: "PayTipper",
  fee: 100 as NonNegativeNumber,
  privacyUrl
};

describe("PspRadioItem", () => {
  jest.useFakeTimers();
  it(`match snapshot`, () => {
    const component = render(<PspRadioItem psp={payPalPsp} />);
    expect(component).toMatchSnapshot();
  });

  it(`component should be defined`, () => {
    const component = render(
      <PspRadioItem psp={payPalPsp} testID={"PspRadioItemTestID"} />
    );
    expect(component.queryByTestId("PspRadioItemTestID")).not.toBeNull();
  });

  it(`should be present the info icon`, () => {
    const component = render(<PspRadioItem psp={payPalPsp} />);
    expect(component.queryByTestId("infoIconTestID")).not.toBeNull();
  });

  it(`should be present at least the name or the logo`, () => {
    const component = render(<PspRadioItem psp={payPalPsp} />);
    const pspName = component.queryByTestId("pspNameTestID");
    const pspLogo = component.queryByTestId("pspNameLogoID");
    expect(pspName === null && pspLogo === null).toBeFalsy();
  });

  it(`info icon should present the bottom sheet`, () => {
    const component = render(<PspRadioItem psp={payPalPsp} />);
    const infoIcon = component.queryByTestId("infoIconTestID");
    if (infoIcon) {
      fireEvent.press(infoIcon);
      expect(mockPresent).toHaveBeenCalledTimes(1);
    }
  });
});
