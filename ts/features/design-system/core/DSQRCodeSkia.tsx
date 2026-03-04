import {
  ContentWrapper,
  H3,
  IOColors,
  IOSkeleton,
  VStack,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import QRCode from "react-native-qrcode-skia";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  qrWrapper: {
    alignItems: "center",
    paddingVertical: 16
  }
});

const QR_SIZE = 220;

const ISO_18013_5_MOCK_PAYLOAD =
  "mdoc:g2MxLjCCAdgYWEukAQIgASFYIIhuL5es5G5Vup3XJCV58pk7ZOFu89yrla_UlzM9j6EvIlggXqauqIFrlri6AMWzCjGmsA1vyLm0yqK34-FOnPMKXqiBgwIBowD0AfULUEXv73QuO0xxjpjEp-Sjti4";

export const DSQRCodeSkia = () => {
  const theme = useIOTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const renderQR = (qr: React.ReactElement) =>
    ready ? qr : <IOSkeleton shape="square" size={QR_SIZE} radius={8} />;

  return (
    <DesignSystemScreen title="QR Code Skia">
      <ContentWrapper>
        <VStack space={32}>
          {/* Square (default) */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>Square</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCode
                  value={ISO_18013_5_MOCK_PAYLOAD}
                  errorCorrectionLevel="H"
                  size={QR_SIZE}
                  color={IOColors[theme["textBody-default"]]}
                  shapeOptions={{ shape: "square", eyePatternShape: "square" }}
                />
              )}
            </View>
          </VStack>

          {/* Rounded */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>Rounded</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCode
                  value={ISO_18013_5_MOCK_PAYLOAD}
                  errorCorrectionLevel="H"
                  size={QR_SIZE}
                  color={IOColors["blueIO-500"]}
                  shapeOptions={{
                    shape: "rounded",
                    eyePatternShape: "rounded",
                    gap: 0.1,
                    eyePatternGap: 0.1
                  }}
                />
              )}
            </View>
          </VStack>

          {/* Circle */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>Circle</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCode
                  value={ISO_18013_5_MOCK_PAYLOAD}
                  errorCorrectionLevel="H"
                  size={QR_SIZE}
                  color={IOColors["blueIO-500"]}
                  shapeOptions={{
                    shape: "circle",
                    eyePatternShape: "rounded",
                    gap: 0.15
                  }}
                />
              )}
            </View>
          </VStack>

          {/* Diamond */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>Diamond</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCode
                  value={ISO_18013_5_MOCK_PAYLOAD}
                  errorCorrectionLevel="H"
                  size={QR_SIZE}
                  color={IOColors["blueIO-600"]}
                  shapeOptions={{
                    shape: "diamond",
                    eyePatternShape: "square",
                    gap: 0.1
                  }}
                />
              )}
            </View>
          </VStack>

          <VSpacer size={32} />
        </VStack>
      </ContentWrapper>
    </DesignSystemScreen>
  );
};
