import { View, StyleSheet } from "react-native";
import { memo, useState } from "react";
import {
  HStack,
  Body,
  Icon,
  IOButton,
  IOColors,
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
import I18n from "../../../../i18n";
import { IT_WALLET_ID_LOGO } from "../utils/constants";
import { ItwJwtCredentialStatus } from "../utils/itwTypesUtils";

type Props = {
  onShow: () => void;
  pidStatus?: ItwJwtCredentialStatus;
};
type WalletIDAllowedStatus = Exclude<ItwJwtCredentialStatus, "valid">;

const walletIdStatusMap: Record<WalletIDAllowedStatus, IOIconsProps> = {
  jwtExpiring: {
    name: "warningFilled",
    color: "warning-850"
  },
  jwtExpired: {
    name: "errorFilled",
    color: "error-850"
  }
};

export const ItwWalletID = memo(({ pidStatus, onShow }: Props) => (
  <View style={styles.itwWalletID}>
    <BackgroundGradient />
    <HStack style={styles.hStack} space={8}>
      <Icon name={IT_WALLET_ID_LOGO} color="blueIO-500" />
      <Body weight="Semibold" color="grey-850">
        {I18n.t("features.itWallet.walletID.title")}
      </Body>
      <ItwWalletIDStatus pidStatus={pidStatus} />
    </HStack>
    <IOButton
      color="primary"
      variant="link"
      label={I18n.t("features.itWallet.walletID.show")}
      onPress={onShow}
    />
  </View>
));

const ItwWalletIDStatus = ({ pidStatus }: Pick<Props, "pidStatus">) =>
  pipe(
    O.fromNullable(pidStatus),
    O.filter((s): s is WalletIDAllowedStatus => s in walletIdStatusMap),
    O.fold(constNull, status => {
      const iconProps = walletIdStatusMap[status];

      return <Icon size={16} {...iconProps} />;
    })
  );

const BackgroundGradient = () => {
  const [{ width, height }, setDimensions] = useState({ width: 0, height: 0 });

  return (
    <Canvas
      style={StyleSheet.absoluteFill}
      onLayout={event => {
        setDimensions({
          width: event.nativeEvent.layout.width,
          height: event.nativeEvent.layout.height
        });
      }}
    >
      <RoundedRect x={0} y={0} width={width} height={height} r={8}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, height)}
          colors={[IOColors.white, IOColors.white + "00"]}
        />
      </RoundedRect>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  itwWalletID: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 24
  },
  hStack: {
    alignItems: "center"
  }
});
