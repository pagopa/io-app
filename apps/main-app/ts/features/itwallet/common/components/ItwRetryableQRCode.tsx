/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Body,
  Icon,
  IOButton,
  IOColors,
  IOIcons
} from "@pagopa/io-app-design-system";
import { memo } from "react";
import { Appearance, StyleSheet, View } from "react-native";

import {
  QrCodeImage,
  QrCodeImageProps
} from "../../../../components/QrCodeImage";

type Props = QrCodeImageProps & {
  /**
   * If true, shows a loading indicator on the retry button
   */
  isRetrying?: boolean;
  /**
   * Function called when the retry button is pressed
   */
  onRetry: () => void;
  /**
   * Text shown above the retry button to describe the issue or context
   */
  retryDescription: string;
  /**
   * Icon shown above the retry description (defaults to "noticeFilled")
   */
  retryIcon?: Extract<IOIcons, "noticeFilled" | "warningFilled">;
  /**
   * Label of the retry button
   */
  retryLabel: string;
  /**
   * If `true`, displays the retry UI instead of the QR code
   */
  shouldRetry?: boolean;
};

/**
 * Component that renders a QR code from a given value and,
 * if any error occur, it displays a cta that allows to retry
 * the operation
 */
const ItwRetryableQRCode = ({
  shouldRetry,
  retryDescription,
  retryLabel,
  retryIcon = "noticeFilled",
  isRetrying,
  onRetry,
  ...qrCodeProps
}: Props) => {
  if (shouldRetry) {
    return (
      <View style={[styles.retryBox, { width: qrCodeProps.size }]}>
        <Icon color="grey-700" name={retryIcon} size={24} />
        <Body style={styles.retryDescription}>{retryDescription}</Body>
        {/* This margin top is set to avoid a visual glitch when loading state changes */}
        <View style={{ marginTop: isRetrying ? -4 : 0 }}>
          {/* @ts-ignore */}
          <IOButton
            label={retryLabel}
            loading={isRetrying}
            onPress={onRetry}
            variant="link"
          />
        </View>
      </View>
    );
  }

  const colorScheme = Appearance.getColorScheme();
  return <QrCodeImage {...qrCodeProps} inverted={colorScheme === "dark"} />;
};

const styles = StyleSheet.create({
  retryBox: {
    backgroundColor: IOColors["grey-50"],
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: 1,
    padding: 16,
    borderRadius: 16,
    gap: 8
  },
  retryDescription: {
    textAlign: "center"
  }
});

const MemoizedItwRetryableQRCode = memo(ItwRetryableQRCode);
export { MemoizedItwRetryableQRCode as ItwRetryableQRCode };
