import { IOColors } from "@io-app/design-system";
import I18n from "i18next";
import { ComponentProps, useState } from "react";
import { StyleSheet, View } from "react-native";
import Pdf from "react-native-pdf";

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

type Props = Omit<ComponentProps<typeof Pdf>, "onLoadComplete" | "source"> &
  OwnProps;

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
        accessibilityLabel={I18n.t("messagePDFPreview.pdfAccessibility")}
        accessible={true}
        style={{ flex: 1 }}
      >
        {/**
         * Be aware that, in react-native-pdf 6.7.7, on Android, there is a bug where
         * onLoadComplete callback is not called. So, in order to detect proper PDF
         * loading ending, we rely on onPageChanged, which is called to report that the
         * first page has loaded
         */}
        <Pdf
          {...rest}
          onError={(...args) => {
            setIsLoading(false);
            onError?.(...args);
          }}
          onLoadComplete={commonOnLoadingCompleted}
          onPageChanged={commonOnLoadingCompleted}
          source={{ uri: downloadPath, cache: true }}
          style={[styles.pdf, style]}
        />
      </View>
    </LoadingSpinnerOverlay>
  );
};
