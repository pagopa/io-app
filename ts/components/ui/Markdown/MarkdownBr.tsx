import { Text } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ComponentProps } from "../../../types/react";

type Props = ComponentProps<Text>;

class MarkdownBr extends React.PureComponent<Props, never> {
  public render() {
    return <Text {...this.props} />;
  }
}
export default connectStyle("UIComponent.MarkdownBr", {}, mapPropsToStyleNames)(
  MarkdownBr
);
