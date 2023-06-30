import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import I18n from "../../i18n";
import { useIOSelector } from "../../store/hooks";
import { isDesignSystemEnabledSelector } from "../../store/reducers/persistedPreferences";
import { WithTestID } from "../../types/WithTestID";
import { Badge } from "../core/Badge";
import { Icon } from "../core/icons";
import { IOLogoPaymentType, LogoPayment } from "../core/logos";
import { VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { NewH6 } from "../core/typography/NewH6";
import { useIOTheme } from "../core/variables/IOColors";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles,
  IOVisualCostants
} from "../core/variables/IOStyles";
import Avatar from "./Avatar";
import {
  PressableBaseProps,
  PressableListItemBase
} from "./utils/baseListItems";

type LogoNameOrUri = IOLogoPaymentType | ImageURISource;
export type ListItemTransaction = WithTestID<
  PressableBaseProps & {
    hasChevronRight?: boolean;
    isLoading?: boolean;
    paymentLogoOrUrl?: LogoNameOrUri;
    subtitle: string;
    title: string;
  } & (
      | {
          transactionStatus: "success";
          transactionAmount: string;
        }
      | {
          transactionStatus: "failure" | "pending";
          transactionAmount?: string;
        }
    )
>;

type LeftComponentProps = {
  logoNameOrUrl: LogoNameOrUri;
};

const isImageUrI = (
  value: IOLogoPaymentType | ImageURISource
): value is ImageURISource =>
  typeof value === "object" && value.uri !== undefined;

const LeftComponent = ({ logoNameOrUrl }: LeftComponentProps) => {
  if (isImageUrI(logoNameOrUrl)) {
    return <Avatar shape="circle" size="small" logoUri={[logoNameOrUrl]} />;
  } else {
    return (
      <View
        style={{
          width: IOVisualCostants.avatarSizeSmall,
          height: IOVisualCostants.avatarSizeSmall,
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <LogoPayment name={logoNameOrUrl} />
      </View>
    );
  }
};

export const ListItemTransaction = ({
  accessibilityLabel,
  hasChevronRight = false,
  isLoading = false,
  paymentLogoOrUrl,
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

  const designSystemBlue = isDSEnabled ? "blue" : "blueIO-500";
  const ListItemTransactionContent = () => {
    const TransactionAmountOrBadgeComponent = () => {
      switch (transactionStatus) {
        case "success":
          return (
            <NewH6 color={hasChevronRight ? designSystemBlue : "black"}>
              {transactionAmount || "-"}
            </NewH6>
          );

        case "failure":
          return (
            <Badge variant="error" text={I18n.t("global.badges.failed")} />
          );
        case "pending":
          return (
            <Badge variant="info" text={I18n.t("global.badges.onGoing")} />
          );
      }
    };

    return (
      <>
        {paymentLogoOrUrl && (
          <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
            <LeftComponent logoNameOrUrl={paymentLogoOrUrl} />
          </View>
        )}
        <View style={IOStyles.flex}>
          <NewH6 color={theme["textBody-default"]}>{title}</NewH6>
          <LabelSmall weight="Regular" color={theme["textBody-tertiary"]}>
            {subtitle}
          </LabelSmall>
          <VSpacer size={4} />
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
      <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
        <Placeholder.Box
          animate="fade"
          height={IOVisualCostants.avatarSizeSmall}
          width={IOVisualCostants.avatarSizeSmall}
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
