import {
  Body,
  Icon,
  IOButton,
  useScaleAnimation
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { constNull } from "fp-ts/lib/function";
import { ComponentProps } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated from "react-native-reanimated";
import BackgroundImageValid from "../../../../../img/features/itWallet/brand/itw_deck_status.svg";
import BackgroundImageExpired from "../../../../../img/features/itWallet/brand/itw_deck_status_expired.svg";
import ItWalletIdLogoImage from "../../../../../img/features/itWallet/brand/itw_id_logo.svg";
import { ItwJwtCredentialStatus } from "../../common/utils/itwTypesUtils";
import { useItWalletTheme } from "../../common/utils/theme";

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
  const theme = useItWalletTheme();
  const { onPressIn, onPressOut, scaleAnimatedStyle } =
    useScaleAnimation("slight");

  const BackgroundImage =
    pidStatus !== "jwtExpired" ? BackgroundImageValid : BackgroundImageExpired;

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
        style={[
          styles.container,
          scaleAnimatedStyle,
          {
            backgroundColor: theme["banner-background"],
            borderColor: theme["banner-border"]
          }
        ]}
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
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -8,
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: "continuous",
    gap: 6,
    overflow: "hidden"
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
