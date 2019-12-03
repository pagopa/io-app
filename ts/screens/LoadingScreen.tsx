import * as React from "react";
import { View } from "react-native";
import LoadingSpinnerOverlay from "../components/LoadingSpinnerOverlay";
import BaseScreenComponent from "../components/screens/BaseScreenComponent";

interface State {
  isLoading: boolean;
}
/**
 * A loading screen used during the saga startup process to display a Spinner
 * until all the saga are performed, including the navigation in the message screen
 */
class LoadingScreen extends React.PureComponent<never, State> {
  constructor(props: never) {
    super(props);
    this.state = {
      isLoading: true
    };
  }
  public componentWillUnmount() {
    this.setState({ isLoading: false });
  }

  public render() {
    const { isLoading } = this.state;
    return (
      <BaseScreenComponent appLogo={true}>
        <LoadingSpinnerOverlay isLoading={isLoading} loadingOpacity={1}>
          <View />
        </LoadingSpinnerOverlay>
      </BaseScreenComponent>
    );
  }
}

export default LoadingScreen;
