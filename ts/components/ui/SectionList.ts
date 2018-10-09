import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import { SectionList as RNSectionList } from "react-native";

export const SectionList = connectStyle(
  "UIComponent.SectionList",
  {},
  mapPropsToStyleNames
)(RNSectionList);
