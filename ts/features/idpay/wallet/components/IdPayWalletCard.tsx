import {
  Avatar,
  H3,
  H6,
  IOColors,
  LabelSmallAlt,
  VSpacer
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import React from "react";
import { ImageURISource, Pressable, StyleSheet, View } from "react-native";
import Svg, { Circle, ClipPath, Defs, Rect } from "react-native-svg";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { formatNumberAmount } from "../../../../utils/stringBuilder";
import { IDPayDetailsRoutes } from "../../details/navigation";
import {
  withWalletCardBaseComponent,
  WalletCardComponentBaseProps
} from "../../../newWallet/components/WalletCardBaseComponent";

export type IdPayWalletCardProps = {
  initiativeId: string;
  name: string;
  avatarSource: ImageURISource;
  amount: number;
  expireDate: Date;
} & WalletCardComponentBaseProps;

const IdPayCard = (props: IdPayWalletCardProps) => {
  const navigation = useIONavigation();

  const handleOnPress = () => {
    if (props.initiativeId) {
      navigation.navigate(IDPayDetailsRoutes.IDPAY_DETAILS_MAIN, {
        screen: IDPayDetailsRoutes.IDPAY_DETAILS_MONITORING,
        params: {
          initiativeId: props.initiativeId
        }
      });
    }
  };

  return (
    <Pressable style={styles.container} onPress={handleOnPress}>
      <CardShape />
      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <H6 color="blueItalia-850">{props.name}</H6>
            <Avatar size="small" logoUri={props.avatarSource} />
          </View>
          <VSpacer size={16} />
          <LabelSmallAlt>Disponibile</LabelSmallAlt>
          <H3 color="blueItalia-500">
            {formatNumberAmount(props.amount, true, "right")}
          </H3>
        </View>
        <LabelSmallAlt color="blueItalia-850">
          {I18n.t("bonusCard.validUntil", {
            endDate: format(props.expireDate, "MM/YY")
          })}
        </LabelSmallAlt>
      </View>
    </Pressable>
  );
};

const CIRCLE_MASK_SIZE = 32;

const CardShape = () => (
  <View style={styles.card}>
    <Svg width="100%" height="100%">
      <Defs>
        <ClipPath id="clip">
          <Circle cx="75%" cy="0" r={CIRCLE_MASK_SIZE / 2} />
          <Circle cx="75%" cy="100%" r={CIRCLE_MASK_SIZE / 2} />
          <Rect width="100%" height="100%" />
        </ClipPath>
      </Defs>
      <Rect
        width="100%"
        height="100%"
        fill={IOColors["blueItalia-50"]}
        stroke={"#000000"}
        strokeWidth={1}
        strokeOpacity={0.12}
        clipPath="url(#clip)"
        rx={16}
        ry={16}
      />
    </Svg>
  </View>
);

const styles = StyleSheet.create({
  container: {
    aspectRatio: 16 / 10
  },
  card: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 16,
    paddingLeft: 16,
    justifyContent: "space-between"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  }
});

export const IdPayWalletCard = withWalletCardBaseComponent(IdPayCard);
