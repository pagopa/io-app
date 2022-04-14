import { NonNegativeNumber } from "@pagopa/ts-commons/lib/numbers";
import { render } from "@testing-library/react-native";
import React from "react";
import { PspRadioItem } from "../../components/PspRadioItem";
import { privacyUrl } from "../../../../../../config";
import { IOPayPalPsp } from "../../types";

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
});
