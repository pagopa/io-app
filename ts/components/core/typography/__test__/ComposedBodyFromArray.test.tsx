import React from "react";
import { render } from "@testing-library/react-native";
import { BodyProps, ComposedBodyFromArray } from "../ComposedBodyFromArray";

describe("ComposedBodyFromArray", () => {
  it("should match snapshot, empty body, default text align", () => {
    const component = render(<ComposedBodyFromArray body={[]} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, empty body, auto text align", () => {
    const component = render(
      <ComposedBodyFromArray body={[]} textAlign="auto" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, empty body, center text align", () => {
    const component = render(
      <ComposedBodyFromArray body={[]} textAlign="center" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, empty body, justify text align", () => {
    const component = render(
      <ComposedBodyFromArray body={[]} textAlign="justify" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, empty body, left text align", () => {
    const component = render(
      <ComposedBodyFromArray body={[]} textAlign="left" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, empty body, right text align", () => {
    const component = render(
      <ComposedBodyFromArray body={[]} textAlign="right" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, multiple items body, default text align", () => {
    const component = render(
      <ComposedBodyFromArray body={multipleItemsBody} />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, multiple items body, auto text align", () => {
    const component = render(
      <ComposedBodyFromArray body={multipleItemsBody} textAlign="auto" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, multiple items body, center text align", () => {
    const component = render(
      <ComposedBodyFromArray body={multipleItemsBody} textAlign="center" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, multiple items body, justify text align", () => {
    const component = render(
      <ComposedBodyFromArray body={multipleItemsBody} textAlign="justify" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, multiple items body, left text align", () => {
    const component = render(
      <ComposedBodyFromArray body={multipleItemsBody} textAlign="left" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });
  it("should match snapshot, multiple items body, right text align", () => {
    const component = render(
      <ComposedBodyFromArray body={multipleItemsBody} textAlign="right" />
    );
    expect(component.toJSON()).toMatchSnapshot();
  });

  const multipleItemsBody = [
    {
      text: "Multiple ",
      weight: "Regular"
    },
    {
      text: "styles",
      weight: "Bold"
    },
    {
      text: " text ",
      weight: "Light"
    },
    {
      text: "just",
      weight: "Medium"
    },
    {
      text: " weights",
      weight: "Semibold"
    }
  ] as Array<BodyProps>;
});
