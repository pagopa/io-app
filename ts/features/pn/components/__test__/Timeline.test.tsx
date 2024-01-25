import React from "react";
import { render } from "@testing-library/react-native";
import { Timeline, TimelineProps } from "../Timeline";

const data: TimelineProps["data"] = [
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
];

describe("Timeline component", () => {
  it("should match the snapshot", () => {
    const component = render(<Timeline data={data} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
