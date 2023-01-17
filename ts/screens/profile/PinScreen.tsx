import * as React from "react";
import PinScreenComponent from "../../components/PinScreenComponent";
import {
  AppParamsList,
  IOStackNavigationRouteProps
} from "../../navigation/params/AppParamsList";

type Props = IOStackNavigationRouteProps<AppParamsList>;

/**
 * A screen that allows the user to set the unlock code.
 */
const PinScreen = ({ navigation }: Props) => (
  <PinScreenComponent navigation={navigation} isOnboarding={false} />
);

export default PinScreen;
