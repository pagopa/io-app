import { Container } from "native-base";
import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";

export type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

export type Props = OwnProps;
/**
 * This screen show the profile to the authenticated user.
 */
class ProfileScreen extends React.Component<Props, never> {
  public render() {
    return <Container />;
  }
}

export default ProfileScreen;
