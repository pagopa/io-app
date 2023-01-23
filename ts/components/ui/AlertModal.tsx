import React from "react";
import {
  BackHandler,
  NativeEventSubscription,
  StyleSheet,
  View
} from "react-native";
import themeVariables from "../../theme/variables";
import { Body } from "../core/typography/Body";
import { IOColors, hexToRgba } from "../core/variables/IOColors";
import { Overlay } from "./Overlay";

const opaqueBgColor = hexToRgba(IOColors.black, 0.6);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "auto",
    width: "auto",
    backgroundColor: IOColors.white,
    padding: themeVariables.contentPadding,
    borderRadius: 8
  }
});

type Props = Readonly<{
  message: string;
}>;

/**
 * A custom alert to show a message
 */
export class AlertModal extends React.PureComponent<Props> {
  private subscription: NativeEventSubscription | undefined;
  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    // eslint-disable-next-line functional/immutable-data
    this.subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      this.onBackPressed
    );
  }

  public componentWillUnmount() {
    this.subscription?.remove();
  }

  private onBackPressed() {
    return true;
  }

  public render() {
    return (
      <Overlay
        backgroundColor={opaqueBgColor}
        foreground={
          <View style={styles.container}>
            <Body color="bluegreyDark">{this.props.message}</Body>
          </View>
        }
      />
    );
  }
}
