import { Badge, Text, View } from "native-base";
import * as React from "react";
import { Image, ImageBackground, StyleSheet } from "react-native";
import { format } from "date-fns";
import { H2 } from "../../../../../components/core/typography/H2";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { BpdAmount } from "../../store/actions/amount";
import { BpdPeriod } from "../../store/actions/periods";
import { H4 } from "../../../../../components/core/typography/H4";
import I18n from "../../../../../i18n";
import bpdBonusLogo from "../../../../../../img/bonus/bonusVacanze/logo_BonusVacanze_White.png";
import bpdCardBg from "../../../../../../img/bonus/bpd/cards_bonus.png";
import { formatNumberCentsToAmount } from "../../../../../utils/stringBuilder";

type Props = {
  period: BpdPeriod;
  totalAmount: BpdAmount;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 192
  },
  paddedContent: {
    padding: 16,
    paddingTop: 24,
    paddingRight: 20
  },
  row: {
    flexDirection: "row"
    // alignItems: "center",
    // textAlign: "center"
  },
  spaced: {
    justifyContent: "space-between"
  },
  logo: {
    resizeMode: "contain",
    height: 56,
    width: 56,
    alignSelf: "flex-end"
  },
  badgeBase: {
    alignSelf: "flex-end",
    height: 18,
    marginTop: 9
  },
  badgeTextBase: { fontSize: 12, lineHeight: 16 }
});

type BadgeDefinition = {
  style: any;
  label: string;
};

export const BpdCardComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const formatStatusBadge = (): BadgeDefinition => {
    const { period } = props;

    switch (period.status) {
      case "Active":
        return {
          style: {
            backgroundColor: IOColors.white
          },
          label: I18n.t("bonus.bpd.detail.status.active")
        };
      case "Closed":
        return {
          style: {
            backgroundColor: IOColors.black
          },
          label: I18n.t("bonus.bpd.detail.status.closed")
        };
      case "Inactive":
        return {
          style: {
            backgroundColor: IOColors.aqua
          },
          label: I18n.t("bonus.bpd.detail.status.inactive")
        };
      default:
        return {
          style: {
            backgroundColor: IOColors.white
          },
          label: "-"
        };
    }
  };

  const amount = formatNumberCentsToAmount(
    props.totalAmount.totalCashback
  ).split(",");

  return (
    <ImageBackground
      // source={bpdCardBg}
      style={[styles.container, { backgroundColor: IOColors.blue }]}
      imageStyle={{
        resizeMode: "stretch",
        height: 192
      }}
    >
      <View style={[styles.paddedContent]}>
        <View style={[styles.row, styles.spaced]}>
          <View
            style={[
              {
                flexDirection: "column",
                flex: 2,
                borderRightColor: IOColors.black,
                borderRightWidth: 1
              },
              styles.spaced
            ]}
          >
            <View>
              <H2 weight={"Bold"} color={"white"}>
                {I18n.t("bonus.bpd.title")}
              </H2>
              <H4 color={"white"} weight={"Regular"}>
                {format(props.period.startDate, "DD MMM YYYY")} -{" "}
                {format(props.period.endDate, "DD MMM YYYY")}
              </H4>
            </View>
            <View spacer={true} large />
            <View style={{ height: 32 }}>
              <Text
                bold={true}
                white={true}
                style={{
                  fontSize: 24,
                  lineHeight: 35,
                  marginBottom: -8
                }}
              >
                €
                <Text white={true} style={{ fontSize: 32 }}>
                  {amount[0]},
                </Text>
                {amount[1]}
              </Text>
              <H5 color={"white"} weight={"Regular"} style={{}}>
                {I18n.t("bonus.bpd.detail.card.earned")}
              </H5>
            </View>
          </View>
          <View
            style={[
              {
                flexDirection: "column",
                flex: 1
              },
              styles.spaced
            ]}
          >
            <Badge style={[formatStatusBadge().style, styles.badgeBase]}>
              <Text
                semibold={true}
                style={styles.badgeTextBase}
                dark={props.period.status !== "Closed"}
              >
                {formatStatusBadge().label}
              </Text>
            </Badge>
            <Image source={bpdBonusLogo} style={styles.logo} />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};
