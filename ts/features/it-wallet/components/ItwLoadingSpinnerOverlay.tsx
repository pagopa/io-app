import * as React from "react";
import { StyleSheet, View } from "react-native";
import {
  H2,
  H4,
  IOColors,
  VSpacer,
  hexToRgba
} from "@pagopa/io-app-design-system";
import customVariables from "../../../theme/variables";
import { Overlay } from "../../../components/ui/Overlay";
import ItwLoadingSpinner from "./ItwLoadingSpinner";

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
            <ItwLoadingSpinner
              color={IOColors.blue}
              captionTitle={captionTitle}
              captionSubtitle={captionSubtitle}
              size={76}
            />
            <VSpacer size={48} />
            <H2
              style={styles.textAlignCenter}
              testID="LoadingSpinnerCaptionTitleID"
            >
              {captionTitle}
            </H2>
            <VSpacer />
            <H4
              weight="Regular"
              style={styles.textAlignCenter}
              testID="LoadingSpinnerCaptionSubTitleID"
            >
              {captionSubtitle}
            </H4>
          </View>
        )
      }
    >
      {children}
    </Overlay>
  );
};

export default ItwLoadingSpinnerOverlay;
