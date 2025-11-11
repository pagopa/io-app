import {
  Avatar,
  Body,
  H6,
  useIOThemeContext
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

/**
 * Component that renders the ID PAy card in the wallet
 */
export const CdcCard = (props: CdcCardProps) => {
  const useCdcCardStyles = () => {
    const { themeType } = useIOThemeContext();

    const isDarkMode = themeType === "dark";

    const initiativeTitle = isDarkMode
      ? ("blueIO-50" as const)
      : ("blueIO-850" as const);

    const available = isDarkMode ? ("white" as const) : ("blueIO-850" as const);

    const amountColor = isDarkMode
      ? ("blueIO-300" as const)
      : ("blueIO-500" as const);

    const validationColor = isDarkMode
      ? ("blueIO-100" as const)
      : ("blueIO-850" as const);

    return {
      isDarkMode,
      initiativeTitle,
      available,
      amountColor,
      validationColor
    };
  };

  const {
    isDarkMode,
    initiativeTitle,
    available,
    amountColor,
    validationColor
  } = useCdcCardStyles();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {isDarkMode ? <DarkModeWalletCardShape /> : <WalletCardShape />}
      </View>
      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <H6
              color={initiativeTitle}
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{
                width: "80%"
              }}
            >
              Carta della cultura
            </H6>
            <Avatar
              size="small"
              logoUri={{
                uri: "https://assets.cdn.io.pagopa.it/logos/organizations/1199250158.png"
              }}
            />
          </View>
        </View>
        <Body weight="Regular" color={validationColor}>
          {I18n.t("idpay.wallet.card.validThrough", {
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
