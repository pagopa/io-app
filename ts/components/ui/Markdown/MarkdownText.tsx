import { Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ComponentProps } from "../../../types/react";

type OwnProps = {
  inMessage: boolean;
};

type Props = OwnProps & ComponentProps<Text>;

class MarkdownText extends React.PureComponent<Props, never> {
  public render() {
    return <Text selectable {...this.props} />;
  }
}
export default connectStyle(
  "UIComponent.MarkdownText",
  {},
  mapPropsToStyleNames
)(MarkdownText);
