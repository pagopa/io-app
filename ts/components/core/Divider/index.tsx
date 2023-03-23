import React from "react";
import { View } from "react-native";
import { IOColors, IOTheme, IOThemeContext } from "../variables/IOColors";

type DividerOrientation = "vertical" | "horizontal";

type DividerProps = {
  orientation: DividerOrientation;
};

const DEFAULT_BORDER_SIZE = 1;

// Co-authored by Fabio Bombardi
// https://github.com/pagopa/io-app/pull/4478

const DividerStyle = (orientation: DividerOrientation, theme: IOTheme) => {
  const baseStyle = {
    backgroundColor: IOColors[theme["divider-default"]]
  };

  const orientationStyle =
    orientation === "vertical"
      ? { width: DEFAULT_BORDER_SIZE }
      : { height: DEFAULT_BORDER_SIZE };

  return { ...baseStyle, ...orientationStyle };
};

/**
Native `Divider` component
@param  {DividerOrientation} orientation
 */
const BaseDivider = ({ orientation }: DividerProps) => (
  <IOThemeContext.Consumer>
    {theme => <View style={DividerStyle(orientation, theme)} />}
  </IOThemeContext.Consumer>
);

/**
Horizontal Divider component
 */
export const Divider = () => <BaseDivider orientation="horizontal" />;
/**
Vertical Divider component
 */
export const VDivider = () => <BaseDivider orientation="vertical" />;
