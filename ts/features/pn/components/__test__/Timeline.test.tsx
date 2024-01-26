import React from "react";
import { render } from "@testing-library/react-native";
import { Timeline, TimelineProps } from "../Timeline";

const defaultProps: TimelineProps = {
  data: [
    {
      day: "25",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      month: "03",
      time: "10:00",
      status: "viewed"
    },
    {
      day: "25",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      month: "03",
      time: "10:00",
      status: "default"
    },
    {
      day: "25",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      month: "03",
      time: "10:00",
      status: "default"
    },
    {
      day: "25",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      month: "03",
      time: "10:00",
      status: "default"
    }
  ]
};

describe("Timeline component", () => {
  it("should match the snapshot with empty data", () => {
    const component = render(<Timeline data={[]} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should match the snapshot with default props", () => {
    const component = render(<Timeline {...defaultProps} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
