import { CommonActions } from "@react-navigation/native";
import * as React from "react";
import { BackHandler } from "react-native";
import I18n from "../i18n";
import NavigationService from "../navigation/NavigationService";
import variables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import IconFont from "./ui/IconFont";

interface OwnProps {
  [k: string]: any;
  onPress?: () => void;
  white?: boolean;
}

type Props = OwnProps;

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
        <IconFont
          name={"io-back"}
          style={{ color: white ? variables.colorWhite : variables.colorBlack }}
        />
      </ButtonDefaultOpacity>
    );
  }
}

export default GoBackButton;
