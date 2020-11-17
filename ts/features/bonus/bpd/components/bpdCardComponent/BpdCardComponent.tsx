import { Badge, Text, View } from "native-base";
import * as React from "react";
import {
  Image,
  ImageBackground,
  Platform,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";
import { fromNullable } from "fp-ts/lib/Option";
import { format } from "../../../../../utils/dates";
import { H2 } from "../../../../../components/core/typography/H2";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { BpdAmount } from "../../store/actions/amount";
import { BpdPeriod, BpdPeriodStatus } from "../../store/actions/periods";
import { H4 } from "../../../../../components/core/typography/H4";
import I18n from "../../../../../i18n";
import bpdBonusLogo from "../../../../../../img/bonus/bpd/logo_BonusCashback_White.png";
import bpdCardBgFull from "../../../../../../img/bonus/bpd/bonus_bg.png";
import bpdCardBgPreview from "../../../../../../img/bonus/bpd/bonus_preview_bg.png";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
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
  badgePreview: {
    backgroundColor: IOColors.white,
    height: 18
  },
  justifyContentCenter: {
    justifyContent: "center"
  },
  upperShadowBox: {
    marginBottom: -13,
    borderRadius: 8,
    borderTopWidth: 13,
    borderTopColor: "rgba(0,0,0,0.1)",
    height: 17,
    width: "100%"
  },
  bottomShadowBox: {
    marginBottom: 6,
    borderRadius: 8,
    borderBottomWidth: 15,
    borderBottomColor: "rgba(0,0,0,0.1)",
    width: "100%"
  }
});

type BadgeDefinition = {
  style: StyleProp<ViewStyle>;
  label: string;
};

type GraphicalState = {
  amount: ReadonlyArray<string>;
  isInGracePeriod: boolean;
  showLock: boolean;
  statusBadge: BadgeDefinition;
};

const initialGraphicalState: GraphicalState = {
  amount: ["0", "00"],
  isInGracePeriod: false,
  showLock: false,
  statusBadge: {
    style: {
      backgroundColor: IOColors.white
    },
    label: "-"
  }
};

const statusClosedHandler = (props: Props): GraphicalState => {
  const { period, totalAmount } = props;

  const actualDate = new Date();
  const endDate = new Date(period.endDate.getTime());
  endDate.setDate(endDate.getDate() + period.gracePeriod);

  const isInGracePeriod =
    actualDate.getTime() >= period.endDate.getTime() &&
    actualDate.getTime() <= endDate.getTime();

  return {
    ...initialGraphicalState,
    showLock: totalAmount.transactionNumber < period.minTransactionNumber,
    amount:
      totalAmount.transactionNumber < period.minTransactionNumber &&
      !isInGracePeriod
        ? ["0", "00"]
        : formatNumberAmount(props.totalAmount.totalCashback).split(","),
    isInGracePeriod,
    // TODO: Add supercashback business logic
    statusBadge: isInGracePeriod
      ? {
          style: {
            backgroundColor: IOColors.white
          },
          label: I18n.t("profile.preferences.list.wip")
        }
      : {
          style: {
            backgroundColor: IOColors.black
          },
          label: I18n.t("bonus.bpd.details.card.status.closed")
        }
  };
};

const statusActiveHandler = (props: Props): GraphicalState => {
  const { period, totalAmount } = props;

  return {
    ...initialGraphicalState,
    statusBadge: {
      style: {
        backgroundColor: IOColors.white
      },
      label: I18n.t("bonus.bpd.details.card.status.active")
    },
    showLock: totalAmount.transactionNumber < period.minTransactionNumber,
    amount: formatNumberAmount(props.totalAmount.totalCashback).split(",")
  };
};

const statusInactiveHandler = (props: Props): GraphicalState => ({
  ...initialGraphicalState,
  statusBadge: {
    style: {
      backgroundColor: IOColors.aqua
    },
    label: I18n.t("bonus.bpd.details.card.status.inactive")
  },
  showLock: true,
  amount: formatNumberAmount(props.totalAmount.totalCashback).split(",")
});

const statusHandlersMap = new Map<
  BpdPeriodStatus,
  (props: Props) => GraphicalState
>([
  ["Closed", statusClosedHandler],
  ["Active", statusActiveHandler],
  ["Inactive", statusInactiveHandler]
]);

/**
 * if the period is Closed we must check if minimum number of transactions has been reached
 * Unless we'll show a Zero amount value
 *
 * Lock must be shown only if period is Inactive or the transactionNumber didn't reach the minimum target
 *
 * GracePeriod: check if we are in the grace period to show an alert instead of the value
 * grace period is given adding the gracePeriod value of days to period.endDate
 */
const calculateGraphicalState = (props: Props) =>
  fromNullable(
    statusHandlersMap.get(props.period.status)
  ).fold(initialGraphicalState, handler => handler(props));

export const BpdCardComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const {
    amount,
    isInGracePeriod,
    showLock,
    statusBadge
  } = calculateGraphicalState(props);

  const isPeriodClosed = props.period.status === "Closed";

  const FullCard = () => (
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
              {"€ "}
              <Text white={true} style={styles.amountTextUpperFull}>
                {amount[0]},
              </Text>
              {amount[1]}
            </Text>
            <View hspacer={true} small={true} />
            {showLock && (
              <IconFont name="io-lucchetto" size={22} color={IOColors.white} />
            )}
          </View>
          <H5 color={"white"} weight={"Regular"}>
            {I18n.t("bonus.bpd.earned")}
          </H5>
        </View>
      </View>
      <View style={[styles.column, styles.flex1, styles.spaced]}>
        <Badge style={[statusBadge.style, styles.badgeBase]}>
          <Text
            semibold={true}
            style={styles.badgeTextBase}
            dark={!isPeriodClosed}
          >
            {statusBadge.label}
          </Text>
        </Badge>
        <Image source={bpdBonusLogo} style={styles.fullLogo} />
      </View>
    </View>
  );

  const PreviewCard = () => (
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
          {isPeriodClosed && (
            <IconFont name="io-tick-big" size={20} color={IOColors.white} />
          )}
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
            {showLock && (
              <IconFont name="io-lucchetto" size={16} color={IOColors.white} />
            )}
            <View hspacer={true} small={true} />
            {isInGracePeriod ? (
              <Badge style={styles.badgePreview}>
                <Text semibold={true} style={styles.badgeTextBase} dark={true}>
                  {I18n.t("profile.preferences.list.wip")}
                </Text>
              </Badge>
            ) : (
              <Text
                bold={true}
                white={true}
                style={styles.amountTextBasePreview}
              >
                {"€ "}
                <Text white={true} style={styles.amountTextUpperPreview}>
                  {amount[0]},
                </Text>
                {amount[1]}
              </Text>
            )}
          </View>
        </View>
      </View>
      <Image source={bpdBonusLogo} style={styles.previewLogo} />
    </TouchableDefaultOpacity>
  );

  return (
    <>
      {Platform.OS === "android" && <View style={styles.upperShadowBox} />}
      <ImageBackground
        source={props.preview ? bpdCardBgPreview : bpdCardBgFull}
        style={[props.preview ? styles.preview : styles.container]}
        imageStyle={props.preview ? styles.imagePreview : styles.imageFull}
      >
        <View
          style={
            props.preview
              ? styles.paddedContentPreview
              : styles.paddedContentFull
          }
        >
          {props.preview ? <PreviewCard /> : <FullCard />}
        </View>
      </ImageBackground>
      {Platform.OS === "android" && !props.preview && (
        <View style={styles.bottomShadowBox} />
      )}
    </>
  );
};
