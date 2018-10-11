import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { SectionList as RNSectionList } from "react-native";
import { ComponentProps } from "../../types/react";

interface Props extends ComponentProps<RNSectionList<any>> {
  padded: boolean;
}

export const SectionList = connectStyle(
  "UIComponent.SectionList",
  {},
  mapPropsToStyleNames
)<typeof RNSectionList, React.ComponentClass<Props>>(RNSectionList);
