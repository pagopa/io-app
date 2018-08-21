import { Button } from "native-base";
import * as React from "react";
import { BackHandler } from "react-native";
import {
  NavigationScreenProp,
  NavigationState,
  withNavigation
} from "react-navigation";
import variables from "../theme/variables";
import IconFont from "./ui/IconFont";

interface NavigationProps {
  navigation: NavigationScreenProp<NavigationState>;
}

interface OwnProps {
  [k: string]: any;
  onPress?: () => void;
  white?: boolean;
}

type Props = NavigationProps & OwnProps;

class GoBackButton extends React.PureComponent<Props> {
  public static defaultProps: Partial<Props> = {
    white: false
  };

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  private handleBackPress = () => {
    this.getOnPressHandler()();

    return true;
  };

  private handleOnPressDefault = () => this.props.navigation.goBack(null);

  private getOnPressHandler = () =>
    typeof this.props.onPress === "function"
      ? this.props.onPress
      : this.handleOnPressDefault;

  public render() {
    const { white, ...restProps } = this.props;

    const buttonProps = {
      transparent: true,
      ...restProps,
      onPress: this.getOnPressHandler()
    };

    return (
      <Button {...buttonProps}>
        <IconFont
          name="io-back"
          style={{ color: white ? variables.colorWhite : undefined }}
        />
      </Button>
    );
  }
}

export default withNavigation(GoBackButton);
