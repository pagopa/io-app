import {
  Avatar,
  Body,
  H6,
  HStack,
  Icon,
  useIOThemeContext,
  VSpacer
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";
import WalletCardShape from "../../../../../../img/features/cdc/cdc_wallet_card.svg";
import DarkModeWalletCardShape from "../../../../../../img/features/cdc/cdc_wallet_card_dark.svg";

export type CdcCardProps = {
  numberOfCards: number;
  expireDate: Date;
};

// TODO: Edit this logo when the organization logo is available
const CDC_ORGANIZATION_LOGO =
  "https://assets.cdn.io.pagopa.it/logos/organizations/1199250158.png";

/**
 * Component that renders the ID PAy card in the wallet
 */
export const CdcCard = (props: CdcCardProps) => {
  const useCdcCardStyles = () => {
    const { themeType } = useIOThemeContext();

    const isDarkMode = themeType === "dark";

    const textColor = isDarkMode
      ? ("blueIO-50" as const)
      : ("blueIO-850" as const);

    return {
      isDarkMode,
      textColor
    };
  };

  const { isDarkMode, textColor } = useCdcCardStyles();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {isDarkMode ? <DarkModeWalletCardShape /> : <WalletCardShape />}
      </View>
      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <HStack
              space={8}
              style={{
                width: "80%"
              }}
            >
              <H6 color={textColor} ellipsizeMode="tail" numberOfLines={1}>
                {I18n.t("bonus.cdc.wallet.card.title")}
              </H6>
              <Icon name="multiCard" color={textColor} />
            </HStack>
            <Avatar
              size="small"
              logoUri={{
                uri: CDC_ORGANIZATION_LOGO
              }}
            />
          </View>
          <VSpacer size={32} />
          <Body weight="Regular" color={textColor}>
            {I18n.t("bonus.cdc.wallet.card.organization")}
          </Body>
        </View>
        <Body weight="Regular" color={textColor}>
          {I18n.t("bonus.cdc.wallet.card.validThrough", {
            endDate: format(props.expireDate, "DD/MM/YY")
          })}
        </Body>
      </View>
    </View>
  );
};

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
