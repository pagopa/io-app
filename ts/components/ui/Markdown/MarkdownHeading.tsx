import { H1, H2, H3 } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ComponentProps } from "../../../types/react";
import H4 from "../H4";
import H5 from "../H5";
import H6 from "../H6";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type ComponentTypes = { [key in HeadingLevel]: React.ComponentType };

const COMPONENT_TYPES: ComponentTypes = {
  1: H1,
  2: H2,
  3: H3,
  4: H4,
  5: H5,
  6: H6
};

type OwnProps = {
  level: HeadingLevel;
  inMessage: boolean;
};

type Props = OwnProps & ComponentProps<H1>;

class MarkdownHeading extends React.PureComponent<Props, never> {
  public render() {
    const HeadingComponent = COMPONENT_TYPES[this.props.level];
    return <HeadingComponent {...this.props} />;
  }
}
export default connectStyle(
  "UIComponent.MarkdownHeading",
  {},
  mapPropsToStyleNames
)(MarkdownHeading);
