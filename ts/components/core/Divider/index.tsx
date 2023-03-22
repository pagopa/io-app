import React from "react";
import { View } from "react-native";
import { IOColors, IOThemeContext } from "../variables/IOColors";

type DividerOrientation = "vertical" | "horizontal";

type DividerProps = {
  orientation: DividerOrientation;
};

const DEFAULT_BORDER_SIZE = 1;

/**
Native `Divider` component
@param  {SpacerOrientation} orientation 
 */
const BaseDivider = ({ orientation }: DividerProps) => (
  <IOThemeContext.Consumer>
    {theme => (
      <View
        style={{
          ...{
            backgroundColor: IOColors[theme["divider-default"]]
          },
          ...(orientation === "vertical" && {
            width: DEFAULT_BORDER_SIZE
          }),
          ...(orientation === "horizontal" && {
            height: DEFAULT_BORDER_SIZE
          })
        }}
      />
    )}
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
