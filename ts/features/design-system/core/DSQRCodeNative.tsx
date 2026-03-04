import {
  Body,
  ContentWrapper,
  H3,
  IOSkeleton,
  VStack,
  VSpacer,
  useIOTheme
} from "@pagopa/io-app-design-system";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { generateNativeQRCode } from "../../../utils/nativeQRCodeGenerator";
import { DesignSystemScreen } from "../components/DesignSystemScreen";

const styles = StyleSheet.create({
  qrWrapper: {
    alignItems: "center",
    paddingVertical: 16
  }
});

const ISO_18013_5_MOCK_PAYLOAD =
  "mdoc:g2MxLjCCAdgYWEukAQIgASFYIIhuL5es5G5Vup3XJCV58pk7ZOFu89yrla_UlzM9j6EvIlggXqauqIFrlri6AMWzCjGmsA1vyLm0yqK34-FOnPMKXqiBgwIBowD0AfULUEXv73QuO0xxjpjEp-Sjti4";

const useNativeQR = (size: number) => {
  const [uri, setUri] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  useEffect(() => {
    generateNativeQRCode(ISO_18013_5_MOCK_PAYLOAD, size)
      .then(result => {
        setUri(result);
        setError(undefined);
      })
      .catch((e: Error) => {
        setUri(undefined);
        setError(e?.message ?? "Failed to generate QR code");
      });
  }, [size]);
  return { uri, error };
};

type QRImageProps = { size: number };

const QRImage = ({ size }: QRImageProps) => {
  const { uri, error } = useNativeQR(size);
  if (error) {
    return <Body>{error}</Body>;
  }
  return uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size }}
      accessibilityLabel="QR Code"
      resizeMode="contain"
    />
  ) : (
    <IOSkeleton shape="square" size={size} radius={8} />
  );
};

export const DSQRCodeNative = () => {
  const theme = useIOTheme();

  return (
    <DesignSystemScreen title="QR Code Native">
      <ContentWrapper>
        <VStack space={32}>
          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>
              220 px (iOS: Core Image · Android: ZXing)
            </H3>
            <View style={styles.qrWrapper}>
              <QRImage size={220} />
            </View>
          </VStack>

          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>150 px</H3>
            <View style={styles.qrWrapper}>
              <QRImage size={150} />
            </View>
          </VStack>

          <VStack space={8}>
            <H3 color={theme["textHeading-default"]}>300 px</H3>
            <View style={styles.qrWrapper}>
              <QRImage size={300} />
            </View>
          </VStack>

          <VSpacer size={32} />
        </VStack>
      </ContentWrapper>
    </DesignSystemScreen>
  );
};
