import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Pdf from "react-native-pdf";
import LoadingSpinnerOverlay from "../../LoadingSpinnerOverlay";
import { IOColors } from "../../core/variables/IOColors";
import I18n from "../../../i18n";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors.bluegrey
  }
});

type OwnProps = {
  downloadPath: string;
};

type Props = OwnProps & Omit<React.ComponentProps<typeof Pdf>, "source">;

const PdfViewer = ({
  style,
  downloadPath,
  onError,
  onLoadComplete,
  ...rest
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <LoadingSpinnerOverlay
      isLoading={isLoading}
      loadingOpacity={1}
      loadingCaption={I18n.t("messageDetails.attachments.loading")}
    >
      <Pdf
        {...rest}
        source={{ uri: downloadPath, cache: true }}
        style={[styles.pdf, style]}
        onLoadComplete={(...args) => {
          setIsLoading(false);
          onLoadComplete?.(...args);
        }}
        onError={(...args) => {
          setIsLoading(false);
          onError?.(...args);
        }}
      />
    </LoadingSpinnerOverlay>
  );
};

export default PdfViewer;
