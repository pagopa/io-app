import { ComponentProps, useState } from "react";

import { StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";
import { IOColors } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";

const styles = StyleSheet.create({
  pdf: {
    flex: 1,
    backgroundColor: IOColors["grey-700"]
  }
});

type OwnProps = {
  downloadPath: string;
  onLoadComplete?: () => void;
};

type Props = OwnProps &
  Omit<ComponentProps<typeof Pdf>, "source" | "onLoadComplete">;

export const PdfViewer = ({
  style,
  downloadPath,
  onError,
  onLoadComplete,
  ...rest
}: Props) => {
  const [isLoading, setIsLoading] = useState(true);
  const commonOnLoadingCompleted = () => {
    if (isLoading) {
      setIsLoading(false);
      onLoadComplete?.();
    }
  };
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
        {/** Be aware that, in react-native-pdf 6.7.7, on Android, there
         * is a bug where onLoadComplete callback is not called. So,
         * in order to detect proper PDF loading ending, we rely on
         * onPageChanged, which is called to report that the first page
         * has loaded */}
        <Pdf
          {...rest}
          source={{ uri: downloadPath, cache: true }}
          style={[styles.pdf, style]}
          onPageChanged={commonOnLoadingCompleted}
          onLoadComplete={commonOnLoadingCompleted}
          onError={(...args) => {
            setIsLoading(false);
            onError?.(...args);
          }}
        />
      </View>
    </LoadingSpinnerOverlay>
  );
};
