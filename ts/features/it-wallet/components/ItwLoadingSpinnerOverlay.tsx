import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  Body,
  H3,
  IOColors,
  LoadingSpinner,
  VSpacer,
  hexToRgba
} from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import { Overlay } from "../../../components/ui/Overlay";

const styles = StyleSheet.create({
  main: {
    padding: customVariables.contentPadding,
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  textAlignCenter: {
    textAlign: "center"
  }
});

type Props = Readonly<{
  isLoading: boolean;
  captionTitle?: string;
  captionSubtitle?: string;
  loadingOpacity?: number;
  children: React.ReactNode;
  onCancel?: () => void;
}>;

/**
 * A Component to display and overlay animated spinner conditionally.
 * It can be used to display a loading spinner over a view and also renders a caption title and subtitle.
 */
const ItwLoadingSpinnerOverlay: React.FunctionComponent<Props> = (
  props: Props
) => {
  const {
    children,
    isLoading,
    loadingOpacity = 1,
    captionTitle,
    captionSubtitle
  } = props;

  return (
    <Overlay
      backgroundColor={hexToRgba(IOColors.white, loadingOpacity)}
      foreground={
        isLoading && (
          <View style={styles.main}>
            <LoadingSpinner size={76} />
            <VSpacer size={48} />
            <H3
              style={styles.textAlignCenter}
              testID="LoadingSpinnerCaptionTitleID"
            >
              {captionTitle}
            </H3>
            <VSpacer />
            <Body
              style={styles.textAlignCenter}
              testID="LoadingSpinnerCaptionSubTitleID"
            >
              {captionSubtitle}
            </Body>
          </View>
        )
      }
    >
      {children}
    </Overlay>
  );
};

export default ItwLoadingSpinnerOverlay;
