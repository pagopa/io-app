import * as React from "react";
import { BackHandler } from "react-native";
import variables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import IconFont from "./ui/IconFont";

interface Props {
  [k: string]: any;
  onPress: () => void;
  white?: boolean;
}

/**
 * A component to display a the back button (eg on screen header)
 * for items not related to a navigation route (eg Modal and light modals)
 */
export default class GoBackButtonModal extends React.PureComponent<Props> {
  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  private handleBackPress = () => {
    this.props.onPress();
    return true;
  };

  public render() {
    const { white, ...restProps } = this.props;

    const buttonProps = {
      transparent: true,
      ...restProps,
      onPress: this.props.onPress
    };

    return (
      <ButtonDefaultOpacity {...buttonProps}>
        <IconFont
          name={"io-back"}
          style={{ color: white ? variables.colorWhite : undefined }}
        />
      </ButtonDefaultOpacity>
    );
  }
}
