import { Text as NBButtonText } from "native-base";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../i18n";
import variables from "../theme/variables";
import { IOColors, hexToRgba } from "../components/core/variables/IOColors";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";
import BoxedRefreshIndicator from "./ui/BoxedRefreshIndicator";
import { Overlay } from "./ui/Overlay";
import { IOStyles } from "./core/variables/IOStyles";
import { Body } from "./core/typography/Body";

const styles = StyleSheet.create({
  textCaption: {
    padding: variables.contentPadding
  }
});

type Props = Readonly<{
  isLoading: boolean;
  loadingCaption?: string;
  loadingOpacity?: number;
  onCancel?: () => void;
}>;

/**
 * A Component to display and overlay spinner conditionally
 */
class LoadingSpinnerOverlay extends React.Component<Props> {
  public render() {
    const {
      children,
      isLoading,
      loadingCaption,
      loadingOpacity = 0.7,
      onCancel
    } = this.props;
    return (
      <Overlay
        backgroundColor={hexToRgba(IOColors.white, loadingOpacity)}
        foreground={
          isLoading && (
            <BoxedRefreshIndicator
              caption={
                <View style={styles.textCaption}>
                  <Body accessible={true} style={{ textAlign: "center" }}>
                    {loadingCaption || I18n.t("global.remoteStates.wait")}
                  </Body>
                </View>
              }
              action={
                onCancel && (
                  <View style={IOStyles.selfCenter}>
                    <ButtonDefaultOpacity
                      onPress={onCancel}
                      cancel={true}
                      testID={"loadingSpinnerOverlayCancelButton"}
                    >
                      <NBButtonText>
                        {I18n.t("global.buttons.cancel")}
                      </NBButtonText>
                    </ButtonDefaultOpacity>
                  </View>
                )
              }
            />
          )
        }
      >
        {children}
      </Overlay>
    );
  }
}

export default LoadingSpinnerOverlay;
