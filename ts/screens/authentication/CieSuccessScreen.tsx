import * as React from "react";
import { NavigationScreenProp, NavigationState } from "react-navigation";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import WaitComponent from "../../components/screens/cie/WaitComponent";

type OwnProps = {
  navigation: NavigationScreenProp<NavigationState>;
};

type Props = OwnProps;

class CieSuccessScreen extends React.Component<Props> {
  public render() {
    return (
      <BaseScreenComponent goBack={() => this.props.navigation.goBack()}>
        <WaitComponent />
      </BaseScreenComponent>
    );
  }
}

export default CieSuccessScreen;
