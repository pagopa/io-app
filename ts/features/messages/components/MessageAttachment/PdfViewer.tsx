import { useState } from "react";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";
import { IOColors } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";

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

export const PdfViewer = ({
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
      loadingCaption={I18n.t("messageDetails.attachments.loading")}
    >
      <View
        style={{ flex: 1 }}
        accessible={true}
        accessibilityLabel={I18n.t("messagePDFPreview.pdfAccessibility")}
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
      </View>
    </LoadingSpinnerOverlay>
  );
};
