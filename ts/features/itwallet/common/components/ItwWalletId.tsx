import { View, StyleSheet } from "react-native";
import { useState } from "react";
import {
  HStack,
  Body,
  Icon,
  IOButton,
  IOIconsProps
} from "@pagopa/io-app-design-system";
import {
  Canvas,
  RoundedRect,
  vec,
  LinearGradient
} from "@shopify/react-native-skia";
import { constNull, pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { IT_WALLET_ID_GRADIENT, IT_WALLET_ID_LOGO } from "../utils/constants";
import { ItwJwtCredentialStatus } from "../utils/itwTypesUtils";

type Props = {
  isStacked?: boolean;
  pidStatus?: ItwJwtCredentialStatus;
  onShowPress: () => void;
};

type WalletIdAllowedStatus = Exclude<ItwJwtCredentialStatus, "valid">;

const walletIdStatusMap: Record<WalletIdAllowedStatus, IOIconsProps> = {
  jwtExpiring: {
    name: "warningFilled",
    color: "warning-850"
  },
  jwtExpired: {
    name: "errorFilled",
    color: "error-850"
  }
};

export const ItwWalletId = ({ isStacked, pidStatus, onShowPress }: Props) => (
  <View style={[styles.container, isStacked && styles.containerStacked]}>
    <BackgroundGradient />
    <View style={styles.content}>
      <HStack space={8}>
        <Icon name={IT_WALLET_ID_LOGO} color="blueIO-500" />
        <Body weight="Semibold" color="grey-850">
          {I18n.t("features.itWallet.walletId.title")}
        </Body>
        <ItwWalletIdStatus pidStatus={pidStatus} />
      </HStack>
      <IOButton
        color="primary"
        variant="link"
        label={I18n.t("features.itWallet.walletId.show")}
        onPress={onShowPress}
      />
    </View>
  </View>
);

const ItwWalletIdStatus = ({ pidStatus }: Pick<Props, "pidStatus">) =>
  pipe(
    O.fromNullable(pidStatus),
    O.filter((s): s is WalletIdAllowedStatus => s in walletIdStatusMap),
    O.fold(constNull, status => {
      const iconProps = walletIdStatusMap[status];

      return <Icon size={16} {...iconProps} />;
    })
  );

const BackgroundGradient = () => {
  const [{ width, height }, setDimensions] = useState({
    width: 0,
    height: 0
  });

  return (
    <View
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <Canvas style={StyleSheet.absoluteFill}>
        <RoundedRect x={0} y={0} width={width} height={height} r={8}>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(width, 0)}
            colors={IT_WALLET_ID_GRADIENT}
          />
        </RoundedRect>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -8,
    marginBottom: 16,
    height: 56
  },
  containerStacked: {
    height: 96,
    marginBottom: -40 // This allows the header to slide under the underlying component
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24
  }
});
