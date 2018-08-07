import { NativeBase, Switch as NBSwitch } from "native-base";
import * as React from "react";

import variables from "../../theme/variables";

/**
 * NativeBase Switch component styled with the app's brand primary color
 */
const Switch: React.SFC<NativeBase.Switch> = props => (
  <NBSwitch onTintColor={variables.brandPrimary} {...props} />
);

export default Switch;
