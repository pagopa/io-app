import { InitiativeRewardTypeEnum } from "@io-app/api-types/generated/definitions/idpay/InitiativeDTO";
import {
  Avatar,
  Body,
  H3,
  H6,
  useIOThemeContext,
  VSpacer
} from "@io-app/design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { format } from "date-fns";
import I18n from "i18next";
import { ImageURISource, StyleSheet, View } from "react-native";

import WalletCardShape from "../../../../../img/features/idpay/wallet_card.svg";
import DarkModeWalletCardShape from "../../../../../img/features/idpay/wallet_card_dark.svg";
import { useFeatureColors } from "../../../../hooks/useFeatureColors";
import { useIOSelector } from "../../../../store/hooks";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { idPayColors } from "../../colors";
import { idPayWalletInitiativeListSelector } from "../store/reducers";

export type IdPayCardProps = {
  amount: number;
  avatarSource: ImageURISource;
  expireDate: Date;
  name: string;
};

/** Component that renders the ID PAy card in the wallet */
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

  const cardColors = useFeatureColors(idPayColors).walletCard;

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
            <Avatar logoUri={props.avatarSource} size="small" />
          </View>
          {initiativeCardDetails?.initiativeRewardType !==
            InitiativeRewardTypeEnum.EXPENSE && (
            <>
              <VSpacer size={16} />
              <Body color={cardColors.amountLabel} weight="Regular">
                {I18n.t("idpay.wallet.card.available")}
              </Body>
              <H3 color={cardColors.amountValue} testID="idpay-card-amount">
                {formatNumberCentsToAmount(props.amount, true, "right")}
              </H3>
            </>
          )}
        </View>
        <Body color={cardColors.expirationDate} weight="Regular">
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
