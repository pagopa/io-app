import {
  Avatar,
  Body,
  H3,
  H6,
  IOColors,
  useIOThemeContext,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { format } from "date-fns";
import I18n from "i18next";
import {
  ColorSchemeName,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import WalletCardShape from "../../../../../img/features/idpay/wallet_card.svg";
import DarkModeWalletCardShape from "../../../../../img/features/idpay/wallet_card_dark.svg";
import { useIOSelector } from "../../../../store/hooks";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { idPayWalletInitiativeListSelector } from "../store/reducers";

export type IdPayCardProps = {
  name: string;
  avatarSource: ImageURISource;
  amount: number;
  expireDate: Date;
};

const idPayCardColorPalette: Record<
  NonNullable<ColorSchemeName>,
  {
    title: IOColors;
    amountLabel: IOColors;
    amountValue: IOColors;
    expirationDate: IOColors;
  }
> = {
  light: {
    title: "blueIO-850",
    amountLabel: "blueIO-850",
    amountValue: "blueIO-500",
    expirationDate: "blueIO-850"
  },
  dark: {
    title: "blueIO-50",
    amountLabel: "white",
    amountValue: "blueIO-300",
    expirationDate: "blueIO-100"
  }
};

/**
 * Component that renders the ID PAy card in the wallet
 */
export const IdPayCard = (props: IdPayCardProps) => {
  const initiativeListPot = useIOSelector(idPayWalletInitiativeListSelector);
  const initiativeCardDetails = pot.getOrElse(
    pot.map(initiativeListPot, initiativeList =>
      initiativeList.find(
        initiative => initiative.initiativeName === props.name
      )
    ),
    undefined
  );

  const { themeType } = useIOThemeContext();

  const isDarkMode = themeType === "dark";

  const cardColors = isDarkMode
    ? idPayCardColorPalette.dark
    : idPayCardColorPalette.light;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {isDarkMode ? <DarkModeWalletCardShape /> : <WalletCardShape />}
      </View>
      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <H6
              color={cardColors.title}
              ellipsizeMode="tail"
              numberOfLines={1}
              style={{
                width: "80%"
              }}
            >
              {props.name}
            </H6>
            <Avatar size="small" logoUri={props.avatarSource} />
          </View>
          {initiativeCardDetails?.initiativeRewardType !==
            InitiativeRewardTypeEnum.EXPENSE && (
            <>
              <VSpacer size={16} />
              <Body weight="Regular" color={cardColors.amountLabel}>
                {I18n.t("idpay.wallet.card.available")}
              </Body>
              <H3 testID="idpay-card-amount" color={cardColors.amountValue}>
                {formatNumberCentsToAmount(props.amount, true, "right")}
              </H3>
            </>
          )}
        </View>
        <Body weight="Regular" color={cardColors.expirationDate}>
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
