import {
  IOColors,
  useIOExperimentalDesign,
  useTypographyFactory,
  type IOFontFamily,
  type IOFontWeight
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { Text } from "react-native";

type AllowedWeight = Extract<IOFontWeight, "Regular">;
type AllowedColors = Extract<IOColors, "grey-650">;

const fontName: IOFontFamily = "Titillio";
const legacyFontName: IOFontFamily = "TitilliumSansPro";
const fontSize = 14;

type OrganizationNameLabelProps = Omit<
  React.ComponentPropsWithRef<typeof Text>,
  "style"
>;

// Custom Typography component to show the name of Department on CGN card component
const OrganizationNameLabel: React.FunctionComponent<
  OrganizationNameLabelProps
> = props => {
  const { isExperimental } = useIOExperimentalDesign();
  return useTypographyFactory<AllowedWeight, AllowedColors>({
    ...props,
    defaultWeight: "Regular",
    defaultColor: "grey-650",
    font: isExperimental ? fontName : legacyFontName,
    fontStyle: { fontSize },
    lineBreakMode: "head",
    numberOfLines: 1
  });
};

export default OrganizationNameLabel;
