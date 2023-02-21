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

type Props = {
  downloadPath: string;
  onError?: () => void;
  onLoadComplete?: () => void;
};

const PdfViewer = ({ downloadPath, onError, onLoadComplete }: Props) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = () => {
    setIsLoading(false);
    onLoadComplete?.();
  };

  const handleError = () => {
    setIsLoading(false);
    onError?.();
  };

  return (
    <LoadingSpinnerOverlay
      isLoading={isLoading}
      loadingOpacity={1}
      loadingCaption={I18n.t("messageDetails.attachments.loading")}
    >
      <Pdf
        source={{ uri: downloadPath, cache: true }}
        style={styles.pdf}
        onLoadComplete={handleLoadComplete}
        onError={handleError}
      />
    </LoadingSpinnerOverlay>
  );
};

export default PdfViewer;
