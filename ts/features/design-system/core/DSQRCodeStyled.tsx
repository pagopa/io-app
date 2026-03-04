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
import QRCodeStyled from "react-native-qrcode-styled";
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

export const DSQRCodeStyled = () => {
  const theme = useIOTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const renderQR = (qr: React.ReactElement) =>
    ready ? (
      qr
    ) : (
      <IOSkeleton shape="square" size={QR_SIZE} radius={8} />
    );

  return (
    <DesignSystemScreen title="QR Code Styled">
      <ContentWrapper>
        <VStack space={32}>
          {/* Basic */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>Basic</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCodeStyled
                  data={ISO_18013_5_MOCK_PAYLOAD}
                  size={QR_SIZE}
                  errorCorrectionLevel="H"
                  color={IOColors[theme["textBody-default"]]}
                />
              )}
            </View>
          </VStack>

          {/* Rounded pieces */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>Rounded pieces</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCodeStyled
                  data={ISO_18013_5_MOCK_PAYLOAD}
                  size={QR_SIZE}
                  errorCorrectionLevel="H"
                  color={IOColors["blueIO-500"]}
                  pieceBorderRadius={4}
                  isPiecesGlued
                  outerEyesOptions={{ borderRadius: 8 }}
                  innerEyesOptions={{ borderRadius: 4 }}
                />
              )}
            </View>
          </VStack>

          {/* Gradient */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>Gradient</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCodeStyled
                  data={ISO_18013_5_MOCK_PAYLOAD}
                  size={QR_SIZE}
                  errorCorrectionLevel="H"
                  pieceBorderRadius={2}
                  isPiecesGlued
                  gradient={{
                    type: "linear",
                    options: {
                      colors: [
                        IOColors["blueIO-600"],
                        IOColors["turquoise-500"]
                      ],
                      start: [0, 0],
                      end: [1, 1]
                    }
                  }}
                  outerEyesOptions={{ borderRadius: 8 }}
                  innerEyesOptions={{ borderRadius: 4 }}
                />
              )}
            </View>
          </VStack>

          {/* With padding + card */}
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>With padding</H3>
            <View style={styles.qrWrapper}>
              {renderQR(
                <QRCodeStyled
                  data={ISO_18013_5_MOCK_PAYLOAD}
                  size={QR_SIZE}
                  errorCorrectionLevel="H"
                  color={IOColors["blueIO-500"]}
                  padding={16}
                  pieceBorderRadius={2}
                  style={{
                    borderRadius: 12,
                    backgroundColor: IOColors["grey-50"]
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
