import {
  Body,
  Icon,
  IOButton,
  useScaleAnimation
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { constNull } from "fp-ts/lib/function";
import { ComponentProps, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import BackgroundImageValid from "../../../../../img/features/itWallet/brand/itw_deck_status.svg";
import BackgroundImageExpired from "../../../../../img/features/itWallet/brand/itw_deck_status_expired.svg";
import ItWalletIdLogoImage from "../../../../../img/features/itWallet/brand/itw_id_logo.svg";
import {
  ItwBrandedBox,
  ItwIridescentBorderVariant
} from "../../common/components/ItwBrandedBox";
import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils";

type ItwWalletIdStatusProps = {
  pidStatus?: ItwJwtCredentialStatus;
  pidExpiration?: string;
  onPress?: () => void;
};

const statusIconPropsByPidStatus: Record<
  ItwJwtCredentialStatus,
  ComponentProps<typeof Icon>
> = {
  valid: {
    name: "success",
    color: "success-700",
    testID: "itwWalletIdStatusValidIconTestID"
  },
  jwtExpiring: {
    name: "warningFilled",
    color: "warning-700",
    testID: "itwWalletIdStatusExpiringIconTestID"
  },
  jwtExpired: {
    name: "errorFilled",
    color: "error-600",
    testID: "itwWalletIdStatusExpiredIconTestID"
  }
};

export const ItwWalletIdStatus = ({
  onPress,
  pidStatus = "valid",
  pidExpiration
}: ItwWalletIdStatusProps) => {
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("slight");

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0
  });

  const BackgroundImage =
    pidStatus !== "jwtExpired" ? BackgroundImageValid : BackgroundImageExpired;

  const handleOnLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const borderVariantByPidStatus: Record<
    ItwJwtCredentialStatus,
    ItwIridescentBorderVariant
  > = {
    valid: "default",
    jwtExpiring: "warning",
    jwtExpired: "error"
  };

  return (
    <Pressable
      testID={"itwWalletIdStatusTestID"}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      accessible={true}
      accessibilityRole="button"
    >
      <Animated.View
        onLayout={handleOnLayout}
        style={[styles.container, scaleAnimatedStyle]}
      >
        {/* Branded Box with animated border and light effect */}
        <ItwBrandedBox
          width={size.width}
          height={size.height}
          variant={borderVariantByPidStatus[pidStatus]}
        >
          {/* Background Image  */}
          <BackgroundImage
            style={[
              styles.backgroundImage,
              pidStatus === "valid"
                ? styles.backgroundImageStickyTop
                : styles.backgroundImageStickyBottom
            ]}
            width={72}
            height={100}
          />

          {/* Header  */}
          <View style={styles.header}>
            <ItWalletIdLogoImage width={103} height={24} />
            <Icon size={16} {...statusIconPropsByPidStatus[pidStatus]} />
          </View>

          {/* Content  */}
          {pidStatus === "jwtExpiring" && (
            <Body style={styles.content}>
              Conferma la tua identità entro il{" "}
              <Body weight="Semibold">
                {format(pidExpiration || "", "DD/MM/YYYY")}
              </Body>
            </Body>
          )}
          {pidStatus === "jwtExpired" && (
            <Body style={styles.content}>
              Conferma la tua identità per continuare con i tuoi documenti
            </Body>
          )}

          {/* Optional Action Button  */}
          {pidStatus === "jwtExpired" && (
            <View pointerEvents="none">
              <IOButton variant="link" label="Inizia" onPress={constNull} />
            </View>
          )}
        </ItwBrandedBox>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -8
  },
  backgroundImage: {
    position: "absolute",
    right: -1
  },
  backgroundImageStickyBottom: {
    bottom: -5
  },
  backgroundImageStickyTop: {
    top: -8
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  content: {
    maxWidth: "80%"
  }
});
