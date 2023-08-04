import { render } from "@testing-library/react-native";
import React from "react";
import { ToastNotification } from "../ToastNotification";
import { Toast } from "../types";

describe("Test ToastNotification component", () => {
  it.each<Toast>([
    { message: "Hello", icon: "checkTick" },
    { message: "Hello", variant: "error" },
    { message: "Hello", variant: "info" },
    { message: "Hello", variant: "neutral" },
    { message: "Hello", variant: "success" },
    { message: "Hello", variant: "warning" }
  ])("should match snapshot for props (%s)", toast => {
    const component = render(<ToastNotification {...toast} />);
    expect(component).toMatchSnapshot();
  });
});
