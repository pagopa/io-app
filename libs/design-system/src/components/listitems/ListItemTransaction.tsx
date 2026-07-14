import { isValidElement, ReactNode } from "react";
import { ImageURISource, View } from "react-native";

import { useIOTheme } from "../../context";
import {
  IOColors,
  IOListItemLogoMargin,
  IOListItemStyles,
  IOListItemVisualParams,
  IOVisualCostants
} from "../../core";
import { WithTestID } from "../../utils/types";
import { isImageUri } from "../../utils/url";
import { Avatar } from "../avatar/Avatar";
import { Badge } from "../badge/Badge";
import { LogoPaymentWithFallback } from "../common/LogoPaymentWithFallback";
import { Icon, IOIconSizeScale } from "../icons";
import { HStack, VStack } from "../layout";
import { IOLogoPaymentType } from "../logos";
import { IOSkeleton } from "../skeleton";
import { BodySmall, H6 } from "../typography";
import {
  PressableBaseProps,
  PressableListItemBase
} from "./PressableListItemBase";

export type ListItemTransaction = WithTestID<
  PressableBaseProps & {
    accessible?: boolean;
    isLoading?: boolean;
    loadingAccessibilityLabel?: string;
    /**
     * The maximum number of lines to display for the title.
     * @default 2
     */
    numberOfLines?: number;
    /**
     * A logo that will be displayed on the left of the list item.
     *
     * Must be a {@link IOLogoPaymentType} or an {@link ImageURISource} or an {@link Icon}.
     */
    paymentLogoIcon?: ListItemTransactionLogo;
    showChevron?: boolean;
    subtitle: string;
    title: string;
  } & (
      | {
          transaction: {
            amount: string;
            amountAccessibilityLabel: string;
            badge?: never;
            refund?: boolean;
          };
        }
      | {
          transaction: {
            amount?: string;
            amountAccessibilityLabel?: string;
            badge: ListItemTransactionBadge;
            refund?: never;
          };
        }
    )
>;

export type ListItemTransactionBadge = {
  text: string;
  variant: Badge["variant"];
};

export type ListItemTransactionLogo =
  | ImageURISource
  | IOLogoPaymentType
  | ReactNode;

const CARD_LOGO_SIZE: IOIconSizeScale = 24;
const MUNICIPALITY_LOGO_SIZE = 44;
// this is the <Avatar/>'s "small" size,
// since it is bigger than the card logos, we use
// it as a base size for homogeneous sizing via container size.

const ListItemTransactionContent = ({
  paymentLogoIcon,
  numberOfLines,
  title,
  subtitle,
  badge,
  amountAccessibilityLabel,
  showChevron,
  amount,
  refund
}: Pick<
  ListItemTransaction,
  "numberOfLines" | "paymentLogoIcon" | "showChevron" | "subtitle" | "title"
> & {
  amount: string | undefined;
  amountAccessibilityLabel: string | undefined;
  badge: ListItemTransactionBadge | undefined;
  refund: boolean | undefined;
}) => {
  const theme = useIOTheme();
  const interactiveColor: IOColors = theme["interactiveElem-default"];
  const amountColor: IOColors = refund
    ? theme.successText
    : theme["textBody-default"];

  return (
    <>
      <HStack
        allowScaleSpacing
        space={IOListItemLogoMargin}
        style={{ alignItems: "center", flexShrink: 1 }}
      >
        {paymentLogoIcon && (
          <View
            style={{
              width: MUNICIPALITY_LOGO_SIZE,
              alignItems: "center"
            }}
          >
            <StartComponent logoIcon={paymentLogoIcon} />
          </View>
        )}
        <View style={{ flexShrink: 1 }}>
          <H6 color={theme["textBody-default"]} numberOfLines={numberOfLines}>
            {title}
          </H6>
          <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
            {subtitle}
          </BodySmall>
        </View>
      </HStack>
      <HStack space={4} style={{ alignItems: "center" }}>
        {badge ? (
          <Badge text={badge?.text} variant={badge?.variant} />
        ) : (
          <H6
            accessibilityLabel={amountAccessibilityLabel}
            color={showChevron ? interactiveColor : amountColor}
            numberOfLines={numberOfLines}
          >
            {amount}
          </H6>
        )}
        {showChevron && (
          <Icon
            allowFontScaling
            color={interactiveColor}
            name="chevronRightListItem"
            size={IOListItemVisualParams.chevronSize}
          />
        )}
      </HStack>
    </>
  );
};

const StartComponent = ({
  logoIcon
}: {
  logoIcon: ListItemTransactionLogo;
}) => {
  if (isImageUri(logoIcon)) {
    return <Avatar logoUri={logoIcon} size="small" />;
  }
  if (isValidElement(logoIcon)) {
    return <>{logoIcon}</>;
  }
  return (
    <LogoPaymentWithFallback
      brand={logoIcon as IOLogoPaymentType}
      size={CARD_LOGO_SIZE}
    />
  );
};

export const ListItemTransaction = ({
  accessibilityLabel,
  loadingAccessibilityLabel,
  showChevron = false,
  isLoading = false,
  paymentLogoIcon,
  onPress,
  subtitle,
  testID,
  title,
  transaction: { amount, amountAccessibilityLabel, badge, refund },
  numberOfLines = 2,
  accessible
}: ListItemTransaction) => {
  if (isLoading) {
    return (
      <ListItemTransactionSkeleton
        loadingAccessibilityLabel={loadingAccessibilityLabel}
      />
    );
  }

  const contentProps = {
    paymentLogoIcon,
    numberOfLines,
    title,
    subtitle,
    badge,
    amountAccessibilityLabel,
    showChevron,
    amount,
    refund
  } as const;

  if (onPress) {
    return (
      <PressableListItemBase
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        testID={testID}
      >
        <ListItemTransactionContent {...contentProps} />
      </PressableListItemBase>
    );
  } else {
    return (
      <View
        accessibilityLabel={accessibilityLabel}
        accessible={accessible}
        style={IOListItemStyles.listItem}
        testID={testID}
      >
        <View
          style={[
            IOListItemStyles.listItemInner,
            { columnGap: IOListItemVisualParams.iconMargin }
          ]}
        >
          <ListItemTransactionContent {...contentProps} />
        </View>
      </View>
    );
  }
};

const ListItemTransactionSkeleton = ({
  loadingAccessibilityLabel
}: Pick<ListItemTransaction, "loadingAccessibilityLabel">) => (
  <View
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    accessible={true}
    style={IOListItemStyles.listItem}
  >
    <View style={IOListItemStyles.listItemInner}>
      <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
        <IOSkeleton
          radius={IOVisualCostants.avatarRadiusSizeSmall}
          shape="square"
          size={IOVisualCostants.avatarSizeSmall}
        />
      </View>
      <VStack space={4} style={{ flexGrow: 1 }}>
        <IOSkeleton height={16} radius={8} shape="rectangle" width={62} />
        <IOSkeleton height={16} radius={8} shape="rectangle" width={107} />
      </VStack>
      <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
        <IOSkeleton height={24} radius={8} shape="rectangle" width={70} />
      </View>
    </View>
  </View>
);
