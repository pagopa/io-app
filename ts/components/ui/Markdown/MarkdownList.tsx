import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ComponentProps } from "../../../types/react";

type Props = ComponentProps<View>;

class MarkdownList extends React.PureComponent<Props, never> {
  public render() {
    return <View {...this.props} />;
  }
}
export default connectStyle(
  "UIComponent.MarkdownList",
  {},
  mapPropsToStyleNames
)(MarkdownList);
