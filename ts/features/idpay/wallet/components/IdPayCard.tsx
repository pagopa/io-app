import * as pot from "@pagopa/ts-commons/lib/pot";
import { Avatar, Body, H3, H6, VSpacer } from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import { ImageURISource, StyleSheet, View } from "react-native";
import WalletCardShape from "../../../../../img/features/idpay/wallet_card.svg";
import I18n from "../../../../i18n";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { useIOSelector } from "../../../../store/hooks";
import { idPayWalletInitiativeListSelector } from "../store/reducers";
import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";

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

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <WalletCardShape />
      </View>
      <View style={styles.content}>
        <View>
          <View style={styles.header}>
            <H6
              color="blueItalia-850"
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
              <Body weight="Semibold" color="black">
                Disponibile
              </Body>
              <H3 testID="idpay-card-amount" color="blueItalia-500">
                {formatNumberCentsToAmount(props.amount, true, "right")}
              </H3>
            </>
          )}
        </View>
        <Body weight="Semibold" color="blueItalia-850">
          {I18n.t("bonusCard.validUntil", {
            endDate: format(props.expireDate, "MM/YY")
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
