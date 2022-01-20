import { render } from "@testing-library/react-native";
import React from "react";
import { EuCovidCertHeader } from "../EuCovidCertHeader";

const headerData = {
  title: "title",
  subTitle: "subtitle",
  logoUrl: "logoUrl"
};
describe("EuCovidCertHeader", () => {
  it(`it should match the snapshot`, () => {
    const component = render(<EuCovidCertHeader headerData={headerData} />);
    expect(component).toMatchSnapshot();
  });
});

describe("when the headerData is full filled", () => {
  it(`it should show the title, subtitle and logo`, () => {
    const component = render(<EuCovidCertHeader headerData={headerData} />);
    expect(component.queryByText(headerData.title)).not.toBeNull();
    expect(component.queryByText(headerData.subTitle)).not.toBeNull();
    expect(component.queryByTestId("EuCovidCertHeaderLogoID")).not.toBeNull();
  });
});

describe("when title and subtitle are empty", () => {
  it(`it should show the title, subtitle and the logo`, () => {
    const component = render(
      <EuCovidCertHeader
        headerData={{ title: "", subTitle: "", logoUrl: "id" }}
      />
    );
    expect(component.queryByTestId("EuCovidCertHeaderTitle")).not.toBeNull();
    expect(component.queryByTestId("EuCovidCertHeaderSubTitle")).not.toBeNull();
    expect(component.queryByTestId("EuCovidCertHeaderLogoID")).not.toBeNull();
  });
});

describe("when the logo url is empty", () => {
  it(`it should show the title, subtitle and not the logo`, () => {
    const component = render(
      <EuCovidCertHeader headerData={{ ...headerData, logoUrl: "" }} />
    );
    expect(component.queryByText(headerData.title)).not.toBeNull();
    expect(component.queryByText(headerData.subTitle)).not.toBeNull();
    expect(component.queryByTestId("EuCovidCertHeaderLogoID")).toBeNull();
  });
});

describe("when the logo url is filled with blank spaces", () => {
  it(`it should show the title, subtitle and not the logo`, () => {
    const component = render(
      <EuCovidCertHeader headerData={{ ...headerData, logoUrl: "    " }} />
    );
    expect(component.queryByText(headerData.title)).not.toBeNull();
    expect(component.queryByText(headerData.subTitle)).not.toBeNull();
    expect(component.queryByTestId("EuCovidCertHeaderLogoID")).toBeNull();
  });
});
