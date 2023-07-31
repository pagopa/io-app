import { Badge } from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { getCardLogoComponent } from "../../features/idpay/common/components/CardLogo";
import I18n from "../../i18n";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { WithTestID } from "../../types/WithTestID";
import { getAccessibleAmountText } from "../../utils/accessibility";
import { isImageUri } from "../../utils/url";
import { IOIconSizeScale, Icon } from "../core/icons";
import { IOLogoPaymentType } from "../core/logos";
import { VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { NewH6 } from "../core/typography/NewH6";
import { IOColors, useIOTheme } from "../core/variables/IOColors";
import { IOListItemLogoMargin } from "../core/variables/IOSpacing";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import Avatar from "./Avatar";
import {
  PressableBaseProps,
  PressableListItemBase
} from "./utils/baseComponents/PressableListItemBase";

export type ListItemTransactionStatus =
  | "success"
  | "failure"
  | "pending"
  | "cancelled"
  | "refunded"
  | "reversal";

type PaymentLogoIcon = IOLogoPaymentType | ImageURISource | React.ReactNode;

export type ListItemTransaction = WithTestID<
  PressableBaseProps & {
    hasChevronRight?: boolean;
    isLoading?: boolean;
    /**
     * A logo that will be displayed on the left of the list item.
     *
     * Must be a {@link IOLogoPaymentType} or an {@link ImageURISource} or an {@link Icon}.
     */
    paymentLogoIcon?: PaymentLogoIcon;
    subtitle: string;
    title: string;
  } & (
      | {
          transactionStatus: "success" | "refunded";
          transactionAmount: string;
        }
      | {
          transactionStatus: "failure" | "pending" | "cancelled" | "reversal";
          transactionAmount?: string;
        }
    )
>;

type LeftComponentProps = {
  logoIcon: PaymentLogoIcon;
};

const CARD_LOGO_SIZE: IOIconSizeScale = 24;
const MUNICIPALITY_LOGO_SIZE = 44;
// this is the <Avatar/>'s "small" size,
// since it is bigger than the card logos, we use
// it as a base size for homogeneous sizing via container size.

const LeftComponent = ({ logoIcon }: LeftComponentProps) => {
  if (isImageUri(logoIcon)) {
    return <Avatar logoUri={[logoIcon]} size="small" shape="circle" />;
  }
  if (React.isValidElement(logoIcon)) {
    return <>{logoIcon}</>;
  }
  return getCardLogoComponent(logoIcon as IOLogoPaymentType, CARD_LOGO_SIZE);
};

export const ListItemTransaction = ({
  accessibilityLabel,
  hasChevronRight = false,
  isLoading = false,
  paymentLogoIcon,
  onPress,
  subtitle,
  testID,
  title,
  transactionAmount,
  transactionStatus = "success"
}: ListItemTransaction) => {
  const theme = useIOTheme();
  const isDSEnabled = useIOSelector(isDesignSystemEnabledSelector);

  if (isLoading) {
    return <SkeletonComponent />;
  }

  const designSystemBlue: IOColors = isDSEnabled ? "blue" : "blueIO-500";

  const ListItemTransactionContent = () => {
    const TransactionAmountOrBadgeComponent = () => {
      switch (transactionStatus) {
        case "success":
          return (
            <NewH6
              accessibilityLabel={getAccessibleAmountText(transactionAmount)}
              color={hasChevronRight ? designSystemBlue : "black"}
            >
              {transactionAmount || ""}
            </NewH6>
          );
        case "refunded":
          return (
            <NewH6
              accessibilityLabel={getAccessibleAmountText(transactionAmount)}
              color={hasChevronRight ? designSystemBlue : "success-700"}
            >
              {transactionAmount || ""}
            </NewH6>
          );
        case "failure":
          return (
            <Badge variant="error" text={I18n.t("global.badges.failed")} />
          );
        case "cancelled":
          return (
            <Badge variant="error" text={I18n.t("global.badges.cancelled")} />
          );
        case "reversal":
          return (
            <Badge
              variant="lightBlue"
              text={I18n.t("global.badges.reversal")}
            />
          );
        case "pending":
          return (
            <Badge variant="info" text={I18n.t("global.badges.onGoing")} />
          );
      }
    };

    return (
      <>
        {paymentLogoIcon && (
          <View
            style={{
              marginRight: IOListItemLogoMargin,
              width: MUNICIPALITY_LOGO_SIZE,
              alignItems: "center"
            }}
          >
            <LeftComponent logoIcon={paymentLogoIcon} />
          </View>
        )}
        <View style={IOStyles.flex}>
          <NewH6 color={theme["textBody-default"]}>{title}</NewH6>
          <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
            {subtitle}
          </LabelSmall>
        </View>
        <View style={Styles.rightSection}>
          <TransactionAmountOrBadgeComponent />
          {hasChevronRight && (
            <Icon
              name="chevronRightListItem"
              color={designSystemBlue}
              size={IOListItemVisualParams.chevronSize}
            />
          )}
        </View>
      </>
    );
  };

  return pipe(
    onPress,
    O.fromNullable,
    O.fold(
      () => (
        <View
          style={IOListItemStyles.listItem}
          testID={testID}
          accessible={true}
          accessibilityLabel={accessibilityLabel}
        >
          <View style={IOListItemStyles.listItemInner}>
            <ListItemTransactionContent />
          </View>
        </View>
      ),
      onPress => (
        <PressableListItemBase
          onPress={onPress}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
        >
          <ListItemTransactionContent />
        </PressableListItemBase>
      )
    )
  );
};

const SkeletonComponent = () => (
  <View style={IOListItemStyles.listItem} accessible={false}>
    <View style={IOListItemStyles.listItemInner}>
      <View
        style={{
          marginRight: IOListItemVisualParams.iconMargin,
          marginLeft: IOListItemLogoMargin
        }}
      >
        <Placeholder.Box
          animate="fade"
          height={MUNICIPALITY_LOGO_SIZE}
          width={MUNICIPALITY_LOGO_SIZE}
          radius={100}
        />
      </View>
      <View style={IOStyles.flex}>
        <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
        <VSpacer size={4} />
        <Placeholder.Box animate="fade" radius={8} width={107} height={16} />
      </View>
      <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
        <Placeholder.Box animate="fade" radius={8} width={70} height={24} />
      </View>
    </View>
  </View>
);

const Styles = StyleSheet.create({
  rightSection: {
    marginLeft: IOListItemVisualParams.iconMargin,
    flexDirection: "row",
    alignItems: "center",
    height: "100%"
  }
});
