import { CommonActions } from "@react-navigation/native";
import * as React from "react";
import { BackHandler, NativeEventSubscription } from "react-native";
import I18n from "../i18n";
import NavigationService from "../navigation/NavigationService";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import { Icon } from "./core/icons";

interface OwnProps {
  [k: string]: any;
  onPress?: () => void;
  white?: boolean;
}

type Props = OwnProps;

class GoBackButton extends React.PureComponent<Props> {
  private subscription: NativeEventSubscription | undefined;
  public static defaultProps: Partial<Props> = {
    white: false
  };

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.handleBackPress
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  private handleBackPress = () => {
    this.getOnPressHandler()();

    return true;
  };

  private handleOnPressDefault = () =>
    NavigationService.dispatchNavigationAction(CommonActions.goBack());

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
      <ButtonDefaultOpacity
        {...buttonProps}
        accessibilityLabel={I18n.t("global.buttons.back")}
      >
        <Icon name="legChevronLeft" color={white ? "white" : "black"} />
      </ButtonDefaultOpacity>
    );
  }
}

export default GoBackButton;
