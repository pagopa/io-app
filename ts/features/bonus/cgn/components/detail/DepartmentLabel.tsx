import * as React from "react";
import { Text } from "react-native";
import {
  IOFontFamily,
  IOFontWeight
} from "../../../../../components/core/fonts";
import { IOColorType } from "../../../../../components/core/variables/IOColors";
import { typographyFactory } from "../../../../../components/core/typography/Factory";

type AllowedWeight = Extract<IOFontWeight, "Regular">;

type AllowedColors = Extract<IOColorType, "black">;

const fontName: IOFontFamily = "TitilliumWeb";
const fontSize = 12;

type DepartmentLabelProps = Omit<
  React.ComponentPropsWithRef<typeof Text>,
  "style"
>;

// Custom Typography component to show the name of Department on CGN card component
const DepartmentLabel: React.FunctionComponent<DepartmentLabelProps> = props =>
  typographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "black",
    font: fontName,
    fontStyle: { fontSize }
  });

export default DepartmentLabel;
