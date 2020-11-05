import { Badge, Text, View } from "native-base";
import * as React from "react";
import { Image, ImageBackground, StyleSheet } from "react-native";
import { format } from "../../../../../utils/dates";
import { H2 } from "../../../../../components/core/typography/H2";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { BpdAmount } from "../../store/actions/amount";
import { BpdPeriod } from "../../store/actions/periods";
import { H4 } from "../../../../../components/core/typography/H4";
import I18n from "../../../../../i18n";
import bpdBonusLogo from "../../../../../../img/bonus/bpd/logo_BonusCashback_White.png";
import bpdCardBgFull from "../../../../../../img/bonus/bpd/bonus_bg.png";
import bpdCardBgPreview from "../../../../../../img/bonus/bpd/bonus_preview_bg.png";
import { formatNumberCentsToAmount } from "../../../../../utils/stringBuilder";
import IconFont from "../../../../../components/ui/IconFont";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";

type Props = {
  period: BpdPeriod;
  totalAmount: BpdAmount;
  preview?: boolean;
  onPress?: () => void;
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1
  },
  flex2: {
    flex: 2
  },
  container: {
    flex: 1,
    height: 192
  },
  paddedContentFull: {
    paddingLeft: 16,
    paddingTop: 24,
    paddingRight: 20
  },
  paddedContentPreview: {
    paddingLeft: 18,
    paddingTop: 8,
    paddingRight: 22
  },
  row: {
    flexDirection: "row"
  },
  column: {
    flexDirection: "column"
  },
  spaced: {
    justifyContent: "space-between"
  },
  fullLogo: {
    resizeMode: "contain",
    height: 56,
    width: 56,
    alignSelf: "flex-end"
  },
  previewLogo: {
    resizeMode: "contain",
    height: 40,
    width: 40,
    alignSelf: "center"
  },
  badgeBase: {
    alignSelf: "flex-end",
    height: 18,
    marginTop: 9
  },
  badgeTextBase: { fontSize: 12, lineHeight: 16 },
  preview: {
    marginBottom: -20,
    height: 88
  },
  imageFull: {
    resizeMode: "stretch",
    height: 192
  },
  imagePreview: {
    resizeMode: "stretch",
    height: 88,
    width: "100%"
  },
  amountTextBaseFull: {
    fontSize: 24,
    lineHeight: 35,
    marginBottom: -8
  },
  amountTextUpperFull: { fontSize: 32 },
  amountTextBasePreview: {
    fontSize: 16,
    lineHeight: 32
  },
  amountTextUpperPreview: { fontSize: 24 },
  alignItemsCenter: {
    alignItems: "center"
  },
  justifyContentCenter: {
    justifyContent: "center"
  }
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
          label: I18n.t("bonus.bpd.details.card.status.active")
        };
      case "Closed":
        return {
          style: {
            backgroundColor: IOColors.black
          },
          label: I18n.t("bonus.bpd.details.card.status.closed")
        };
      case "Inactive":
        return {
          style: {
            backgroundColor: IOColors.aqua
          },
          label: I18n.t("bonus.bpd.details.card.status.inactive")
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

  const renderFullCard = () => (
    <View style={[styles.row, styles.spaced]}>
      <View style={[styles.column, styles.flex2, styles.spaced]}>
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
          <View style={[styles.row, { alignItems: "center" }]}>
            <Text bold={true} white={true} style={styles.amountTextBaseFull}>
              €
              <Text white={true} style={styles.amountTextUpperFull}>
                {amount[0]},
              </Text>
              {amount[1]}
            </Text>
            <View hspacer={true} small={true} />
            <IconFont name="io-lucchetto" size={22} color={IOColors.white} />
          </View>
          <H5 color={"white"} weight={"Regular"}>
            {I18n.t("bonus.bpd.earned")}
          </H5>
        </View>
      </View>
      <View style={[styles.column, styles.flex1, styles.spaced]}>
        <Badge style={[formatStatusBadge().style, styles.badgeBase]}>
          <Text
            semibold={true}
            style={styles.badgeTextBase}
            dark={props.period.status !== "Closed"}
          >
            {formatStatusBadge().label}
          </Text>
        </Badge>
        <Image source={bpdBonusLogo} style={styles.fullLogo} />
      </View>
    </View>
  );

  const renderPreviewCard = () => (
    <TouchableDefaultOpacity
      style={[styles.row, styles.spaced]}
      onPress={props.onPress}
    >
      <View style={styles.column}>
        <View style={[styles.row, styles.alignItemsCenter]}>
          <H5
            color={"white"}
            weight={"Regular"}
            style={{ textTransform: "capitalize" }}
          >
            {format(props.period.startDate, "MMMM")} -{" "}
            {format(props.period.endDate, "MMMM YYYY")}
          </H5>
          <View hspacer={true} small={true} />
          <IconFont name="io-tick-big" size={20} color={IOColors.white} />
        </View>
        <View
          style={[
            styles.row,
            styles.spaced,
            styles.alignItemsCenter,
            styles.justifyContentCenter
          ]}
        >
          <H2 weight={"Bold"} color={"white"}>
            {I18n.t("bonus.bpd.name")}
          </H2>
          <View hspacer={true} extralarge={true} />
          <View
            style={[
              styles.row,
              styles.alignItemsCenter,
              styles.justifyContentCenter
            ]}
          >
            <IconFont name="io-lucchetto" size={16} color={IOColors.white} />
            <View hspacer={true} small={true} />
            <Text bold={true} white={true} style={styles.amountTextBasePreview}>
              €
              <Text white={true} style={styles.amountTextUpperPreview}>
                {amount[0]},
              </Text>
              {amount[1]}
            </Text>
          </View>
        </View>
      </View>
      <Image source={bpdBonusLogo} style={styles.previewLogo} />
    </TouchableDefaultOpacity>
  );

  return (
    <ImageBackground
      source={props.preview ? bpdCardBgPreview : bpdCardBgFull}
      style={[props.preview ? styles.preview : styles.container]}
      imageStyle={props.preview ? styles.imagePreview : styles.imageFull}
    >
      <View
        style={
          props.preview ? styles.paddedContentPreview : styles.paddedContentFull
        }
      >
        {props.preview ? renderPreviewCard() : renderFullCard()}
      </View>
    </ImageBackground>
  );
};
