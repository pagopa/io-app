import { connectStyle } from "native-base-shoutem-theme";
import mapPropsToStyleNames from "native-base/src/utils/mapPropsToStyleNames";
import * as React from "react";
import { Text, TextProps } from "react-native";

type Props = TextProps;

const H5: React.SFC<Props> = props => <Text {...props} />;

export default connectStyle("UIComponent.H5", {}, mapPropsToStyleNames)(H5);
