import * as React from "react";
import { ImageURISource, StyleSheet, View } from "react-native";
import Placeholder from "rn-placeholder";
import { WithTestID } from "../../types/WithTestID";
import { IOBadge } from "../core/IOBadge";
import { Icon } from "../core/icons";
import { IOLogoPaymentType, LogoPayment } from "../core/logos";
import { VSpacer } from "../core/spacer/Spacer";
import { LabelSmall } from "../core/typography/LabelSmall";
import { NewH6 } from "../core/typography/NewH6";
import { IOColors, useIOTheme } from "../core/variables/IOColors";
import {
  IOListItemStyles,
  IOListItemVisualParams,
  IOStyles
} from "../core/variables/IOStyles";
import Avatar from "./Avatar";

type LogoNameOrUri = IOLogoPaymentType | ImageURISource;
export type ListItemTransaction = WithTestID<
  {
    accessibilityLabel?: string;
    backgroundColor?: "grey-50" | "white";
    hasChevronRight?: boolean;
    isLoading?: boolean;
    leftPaymentLogoOrUrl?: LogoNameOrUri;
    onPress?: () => void;
    subtitle: string;
    title: string;
  } & (
    | {
        transactionStatus: "success";
        transactionAmount: string;
      }
    | {
        transactionStatus: "failure";
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
    return <LogoPayment size={44} name={logoNameOrUrl} />;
  }
};

export const ListItemTransaction = ({
  accessibilityLabel,
  backgroundColor = "white",
  hasChevronRight = false,
  isLoading = false,
  leftPaymentLogoOrUrl,
  onPress,
  subtitle,
  testID,
  title,
  transactionAmount,
  transactionStatus = "success"
}: ListItemTransaction) => {
  const theme = useIOTheme();

  const renderContent = () => {
    const TransactionAmountOrBadgeComponent = () => {
      switch (transactionStatus) {
        case "success":
          return (
            <NewH6 color={hasChevronRight ? "blueIO-500" : "black"}>
              {transactionAmount || "-"}
            </NewH6>
          );

        case "failure":
          return (
            <IOBadge
              color="red"
              variant="solid"
              labelColor="bluegreyDark"
              text="{FAIULRE}"
            />
          );
      }
    };

    return (
      <>
        {leftPaymentLogoOrUrl && (
          <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
            <LeftComponent logoNameOrUrl={leftPaymentLogoOrUrl} />
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
              color="blue"
              size={IOListItemVisualParams.chevronSize}
            />
          )}
        </View>
        {/* {action && (
        
          <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
            {action}
          </View>
        )} */}
      </>
    );
  };
  return (
    <View
      style={[
        IOListItemStyles.listItem,
        { backgroundColor: IOColors[backgroundColor] }
      ]}
      testID={testID}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={IOListItemStyles.listItemInner}>
        {isLoading ? <SkeletonComponent /> : renderContent()}
      </View>
    </View>
  );
};

const SkeletonComponent = () => (
  <>
    <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
      <Placeholder.Box animate="fade" height={44} width={44} radius={100} />
    </View>
    <View style={IOStyles.flex}>
      <Placeholder.Box animate="fade" radius={8} width={62} height={16} />
      <VSpacer size={4} />
      <Placeholder.Box animate="fade" radius={8} width={107} height={16} />
    </View>
    <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
      <Placeholder.Box animate="fade" radius={8} width={70} height={24} />
    </View>
  </>
);

const Styles = StyleSheet.create({
  rightSection: {
    marginLeft: IOListItemVisualParams.iconMargin,
    flexDirection: "row"
  }
});
