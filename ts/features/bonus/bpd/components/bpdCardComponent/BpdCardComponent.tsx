import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Badge, Text as NBBadgeText } from "native-base";
import * as React from "react";
import {
  Text,
  View,
  Image,
  ImageBackground,
  Platform,
  StyleSheet
} from "react-native";
import { widthPercentageToDP } from "react-native-responsive-screen";
import bpdCardBgFull from "../../../../../../img/bonus/bpd/bonus_bg.png";
import bpdCardBgPreview from "../../../../../../img/bonus/bpd/bonus_preview_bg.png";
import bpdBonusLogo from "../../../../../../img/bonus/bpd/logo_BonusCashback_White.png";
import { HSpacer } from "../../../../../components/core/spacer/Spacer";
import { H2 } from "../../../../../components/core/typography/H2";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import {
  hexToRgba,
  IOColors
} from "../../../../../components/core/variables/IOColors";
import TouchableDefaultOpacity from "../../../../../components/TouchableDefaultOpacity";
import I18n from "../../../../../i18n";
import { localeDateFormat } from "../../../../../utils/locale";
import { formatNumberAmount } from "../../../../../utils/stringBuilder";
import { BpdAmount } from "../../saga/networking/amount";
import { BpdPeriod, BpdPeriodStatus } from "../../store/actions/periods";
import { Icon } from "../../../../../components/core/icons";
import { makeFontStyleObject } from "../../../../../components/core/fonts";

type Props = {
  period: BpdPeriod;
  totalAmount: BpdAmount;
  preview?: boolean;
  onPress?: () => void;
};

const opaqueBorderColor = hexToRgba(IOColors.black, 0.1);

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
    paddingRight: 20,
    paddingBottom: 16
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
    backgroundColor: IOColors.white,
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
    height: "100%"
  },
  imagePreview: {
    resizeMode: "stretch",
    height: 88,
    width: "100%"
  },
  amountTextBaseFull: {
    color: IOColors.white,
    fontSize: 24,
    lineHeight: 35,
    // solution taken from https://github.com/facebook/react-native/issues/7687#issuecomment-309168661
    paddingTop: Platform.select({
      ios: 0,
      android: 10
    }),
    marginBottom: -8,
    ...makeFontStyleObject("Bold")
  },
  amountTextUpperFull: {
    color: IOColors.white,
    fontSize: 32,
    ...makeFontStyleObject("Bold")
  },
  amountTextBasePreview: {
    fontSize: 16,
    lineHeight: 32,
    color: IOColors.white,
    ...makeFontStyleObject("Bold")
  },
  amountTextUpperPreview: {
    color: IOColors.white,
    fontSize: 24,
    ...makeFontStyleObject("Bold")
  },
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
    borderTopColor: opaqueBorderColor,
    height: 17,
    width: "100%"
  },
  bottomShadowBox: {
    marginBottom: 6,
    borderRadius: 8,
    borderBottomWidth: 15,
    borderBottomColor: opaqueBorderColor,
    width: "100%"
  }
});

type BadgeDefinition = {
  label: string;
};

type IconType = "legLocked" | "legUnlocked" | "ok";

type GraphicalState = {
  amount: ReadonlyArray<string>;
  isInGracePeriod: boolean;
  iconName: IconType;
  statusBadge: BadgeDefinition;
};

const initialGraphicalState: GraphicalState = {
  amount: ["0", "00"],
  isInGracePeriod: false,
  iconName: "legLocked",
  statusBadge: {
    label: "-"
  }
};

/**
 * Closed lock must be shown if period is Inactive or the transactionNumber didn't reach the minimum target
 * Open lock must be shown if period is Closed or Active and the transactionNumber reach the minimum target
 * "Ok" (was Fireworks) must be shown if period is Closed or Active and the totalCashback reach the maxAmount
 *
 * @param period
 * @param totalAmount
 */
const iconHandler = (period: BpdPeriod, totalAmount: BpdAmount): IconType => {
  const reachMinTransaction =
    totalAmount.transactionNumber >= period.minTransactionNumber;
  const reachMaxAmount = totalAmount.totalCashback >= period.maxPeriodCashback;
  switch (period.status) {
    case "Active":
    case "Closed":
      return reachMinTransaction && reachMaxAmount
        ? "ok"
        : reachMinTransaction
        ? "legUnlocked"
        : "legLocked";
    default:
      return "legLocked";
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
    amount:
      totalAmount.transactionNumber < period.minTransactionNumber &&
      !isInGracePeriod
        ? ["0", "00"]
        : formatNumberAmount(props.totalAmount.totalCashback).split(
            I18n.t("global.localization.decimalSeparator")
          ),
    isInGracePeriod,
    iconName: iconHandler(props.period, props.totalAmount),
    // TODO: Add supercashback business logic
    statusBadge: isInGracePeriod
      ? {
          label: I18n.t("profile.preferences.list.wip")
        }
      : {
          label: I18n.t("bonus.bpd.details.card.status.closed")
        }
  };
};

const statusActiveHandler = (props: Props): GraphicalState => ({
  ...initialGraphicalState,
  statusBadge: {
    label: I18n.t("bonus.bpd.details.card.status.active")
  },
  amount: formatNumberAmount(props.totalAmount.totalCashback).split(
    I18n.t("global.localization.decimalSeparator")
  ),
  iconName: iconHandler(props.period, props.totalAmount)
});

const statusInactiveHandler = (props: Props): GraphicalState => ({
  ...initialGraphicalState,
  statusBadge: {
    label: I18n.t("bonus.bpd.details.card.status.inactive")
  },
  amount: formatNumberAmount(props.totalAmount.totalCashback).split(
    I18n.t("global.localization.decimalSeparator")
  )
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
 * GracePeriod: check if we are in the grace period to show an alert instead of the value
 * grace period is given adding the gracePeriod value of days to period.endDate
 */
const calculateGraphicalState = (props: Props) =>
  pipe(
    statusHandlersMap.get(props.period.status),
    O.fromNullable,
    O.fold(
      () => initialGraphicalState,
      handler => handler(props)
    )
  );

export const BpdCardComponent: React.FunctionComponent<Props> = (
  props: Props
) => {
  const { amount, isInGracePeriod, iconName, statusBadge } =
    calculateGraphicalState(props);

  const isPeriodClosed = props.period.status === "Closed" && !isInGracePeriod;
  const isPeriodInactive = props.period.status === "Inactive";

  const FullCard = () => (
    <View
      style={[
        styles.row,
        styles.spaced,
        styles.paddedContentFull,
        { height: "100%" }
      ]}
    >
      <View style={[styles.column, styles.flex2, styles.spaced]}>
        <View>
          <H2 weight={"Bold"} color={"white"}>
            {I18n.t("bonus.bpd.title")}
          </H2>
          <H4 color={"white"} weight={"Regular"}>
            {`${localeDateFormat(
              props.period.startDate,
              I18n.t("global.dateFormats.fullFormatShortMonthLiteral")
            )} - ${localeDateFormat(
              props.period.endDate,
              I18n.t("global.dateFormats.fullFormatShortMonthLiteral")
            )}`}
          </H4>
        </View>
        <View>
          <View style={[styles.row, { alignItems: "center" }]}>
            {/* NBCard Text component */}
            <Text style={styles.amountTextBaseFull}>
              {"€ "}
              <Text style={styles.amountTextUpperFull}>
                {`${amount[0]}${I18n.t(
                  "global.localization.decimalSeparator"
                )}`}
              </Text>
              {amount[1]}
            </Text>
            <HSpacer size={8} />
            <Icon name={iconName} size={16} color="white" />
          </View>
          <H5 color={"white"} weight={"Regular"}>
            {I18n.t("bonus.bpd.earned")}
          </H5>
        </View>
      </View>
      <View style={[styles.column, styles.flex1, styles.spaced]}>
        {/* IOBadge - White version not available yet */}
        <Badge style={styles.badgeBase}>
          <NBBadgeText semibold={true} style={styles.badgeTextBase} dark={true}>
            {statusBadge.label}
          </NBBadgeText>
        </Badge>
        <Image source={bpdBonusLogo} style={styles.fullLogo} />
      </View>
    </View>
  );

  const PreviewCard = () => (
    <TouchableDefaultOpacity
      style={[styles.row, styles.spaced, styles.paddedContentPreview]}
      onPress={props.onPress}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityLabel={I18n.t("bonus.bpd.accessibility.card.preview", {
        startDate: localeDateFormat(
          props.period.startDate,
          I18n.t("global.dateFormats.dayFullMonth")
        ),
        endDate: localeDateFormat(
          props.period.endDate,
          I18n.t("global.dateFormats.dayFullMonth")
        ),
        amount: formatNumberAmount(props.totalAmount.totalCashback)
      })}
    >
      <View
        style={[styles.column, { width: widthPercentageToDP("60%") }]}
        accessible={false}
        accessibilityElementsHidden={true}
        importantForAccessibility={"no-hide-descendants"}
      >
        <View style={[styles.row, styles.alignItemsCenter, styles.spaced]}>
          <H5
            color={"white"}
            weight={"Regular"}
            style={{ textTransform: "capitalize" }}
          >
            {`${localeDateFormat(
              props.period.startDate,
              I18n.t("global.dateFormats.dayFullMonth")
            )} - ${localeDateFormat(
              props.period.endDate,
              I18n.t("global.dateFormats.fullFormatFullMonthLiteral")
            )}`}
          </H5>
          <HSpacer size={8} />
          {isPeriodClosed && (
            <Icon name="legCompleted" size={20} color="white" />
          )}
        </View>
        <View style={[styles.row, styles.alignItemsCenter, styles.spaced]}>
          <H2 weight={"Bold"} color={"white"}>
            {I18n.t("bonus.bpd.name")}
          </H2>
          <View
            style={[
              styles.row,
              styles.alignItemsCenter,
              styles.justifyContentCenter
            ]}
          >
            <Icon name={iconName} size={16} color="white" />
            <HSpacer size={8} />
            {isInGracePeriod || isPeriodInactive ? (
              <Badge style={styles.badgePreview}>
                <NBBadgeText
                  semibold={true}
                  style={styles.badgeTextBase}
                  dark={true}
                >
                  {statusBadge.label}
                </NBBadgeText>
              </Badge>
            ) : (
              <Text
                style={[styles.amountTextBasePreview, { textAlign: "right" }]}
              >
                {"€ "}
                <Text style={styles.amountTextUpperPreview}>
                  {`${amount[0]}${I18n.t(
                    "global.localization.decimalSeparator"
                  )}`}
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
      {Platform.OS === "android" && (
        <View
          style={styles.upperShadowBox}
          accessible={false}
          importantForAccessibility={"no"}
          accessibilityElementsHidden={true}
        />
      )}
      <ImageBackground
        source={props.preview ? bpdCardBgPreview : bpdCardBgFull}
        style={props.preview ? styles.preview : styles.container}
        imageStyle={props.preview ? styles.imagePreview : styles.imageFull}
      >
        {props.preview ? <PreviewCard /> : <FullCard />}
      </ImageBackground>
      {Platform.OS === "android" && !props.preview && (
        <View style={styles.bottomShadowBox} />
      )}
    </>
  );
};
