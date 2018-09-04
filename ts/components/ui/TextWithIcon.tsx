import { View } from "native-base";
import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";

import { ComponentProps } from "../../types/react";

interface Props extends ComponentProps<View> {
  danger?: boolean;
  success?: boolean;
}

/**
 * A simple wrapper where you can put an Icon and a Text components that will be rendered side-by-side.
 *
 * More @https://github.com/teamdigitale/italia-app#textwithicon
 */
export default connectStyle(
  "UIComponent.TextWithIcon",
  {},
  mapPropsToStyleNames
)<typeof View, React.ComponentClass<Props>>(View);
