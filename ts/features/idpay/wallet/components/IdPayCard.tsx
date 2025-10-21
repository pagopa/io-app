import {
  Avatar,
  Body,
  H3,
  H6,
  useIOThemeContext,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { format } from "date-fns";
import { ImageURISource, StyleSheet, View } from "react-native";
import I18n from "i18next";
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

  const useIDPayCardStyles = () => {
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
  } = useIDPayCardStyles();

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
              {props.name}
            </H6>
            <Avatar size="small" logoUri={props.avatarSource} />
          </View>
          {initiativeCardDetails?.initiativeRewardType !==
            InitiativeRewardTypeEnum.EXPENSE && (
            <>
              <VSpacer size={16} />
              <Body weight="Regular" color={available}>
                Disponibile
              </Body>
              <H3 testID="idpay-card-amount" color={amountColor}>
                {formatNumberCentsToAmount(props.amount, true, "right")}
              </H3>
            </>
          )}
        </View>
        <Body weight="Regular" color={validationColor}>
          {I18n.t("bonusCard.validUntil", {
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
