import { H1 } from "native-base";
import * as React from "react";
import { ImageSourcePropType } from "react-native";

import ScreenHeader from "./ScreenHeader";

type Props = {
  screenTitle: string;
  icon?: ImageSourcePropType;
};

/**
 * A ScreenHeader that renders the heading as H1
 */
const DefaultScreenHeader: React.SFC<Props> = ({ screenTitle, icon }) => (
  <ScreenHeader heading={<H1>{screenTitle}</H1>} icon={icon} />
);

export default DefaultScreenHeader;
