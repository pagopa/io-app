import { render, RenderOptions } from "@testing-library/react-native";
import { ReactElement } from "react";
import { IODSExperimentalContextProvider } from "../context/IODSExperimentalContextProvider";

export const renderWithExperimentalEnabledContextProvider = (
  ui: ReactElement,
  options?: RenderOptions
) =>
  render(
    <IODSExperimentalContextProvider isExperimentaEnabled={true}>
      {ui}
    </IODSExperimentalContextProvider>,
    options
  );
