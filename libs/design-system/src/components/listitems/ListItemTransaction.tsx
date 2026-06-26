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
import { IOIconSizeScale, Icon } from "../icons";
import { HStack, VStack } from "../layout";
import { IOLogoPaymentType } from "../logos";
import { IOSkeleton } from "../skeleton";
import { BodySmall, H6 } from "../typography";
import {
  PressableBaseProps,
  PressableListItemBase
} from "./PressableListItemBase";

export type ListItemTransactionBadge = {
  text: string;
  variant: Badge["variant"];
};

export type ListItemTransactionLogo =
  | IOLogoPaymentType
  | ImageURISource
  | ReactNode;

export type ListItemTransaction = WithTestID<
  PressableBaseProps & {
    showChevron?: boolean;
    isLoading?: boolean;
    loadingAccessibilityLabel?: string;
    /**
     * A logo that will be displayed on the left of the list item.
     *
     * Must be a {@link IOLogoPaymentType} or an {@link ImageURISource} or an {@link Icon}.
     */
    paymentLogoIcon?: ListItemTransactionLogo;
    subtitle: string;
    title: string;
    /**
     * The maximum number of lines to display for the title.
     * @default 2
     */
    numberOfLines?: number;
    accessible?: boolean;
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
  "paymentLogoIcon" | "numberOfLines" | "title" | "subtitle" | "showChevron"
> & {
  badge: ListItemTransactionBadge | undefined;
  amount: string | undefined;
  amountAccessibilityLabel: string | undefined;
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
          <H6 numberOfLines={numberOfLines} color={theme["textBody-default"]}>
            {title}
          </H6>
          <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
            {subtitle}
          </BodySmall>
        </View>
      </HStack>
      <HStack space={4} style={{ alignItems: "center" }}>
        {badge ? (
          <Badge variant={badge?.variant} text={badge?.text} />
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
            name="chevronRightListItem"
            color={interactiveColor}
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
        onPress={onPress}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        <ListItemTransactionContent {...contentProps} />
      </PressableListItemBase>
    );
  } else {
    return (
      <View
        style={IOListItemStyles.listItem}
        testID={testID}
        accessible={accessible}
        accessibilityLabel={accessibilityLabel}
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
    style={IOListItemStyles.listItem}
    accessible={true}
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
  >
    <View style={IOListItemStyles.listItemInner}>
      <View style={{ marginRight: IOListItemVisualParams.iconMargin }}>
        <IOSkeleton
          shape="square"
          size={IOVisualCostants.avatarSizeSmall}
          radius={IOVisualCostants.avatarRadiusSizeSmall}
        />
      </View>
      <VStack space={4} style={{ flexGrow: 1 }}>
        <IOSkeleton shape="rectangle" width={62} height={16} radius={8} />
        <IOSkeleton shape="rectangle" width={107} height={16} radius={8} />
      </VStack>
      <View style={{ marginLeft: IOListItemVisualParams.iconMargin }}>
        <IOSkeleton shape="rectangle" width={70} height={24} radius={8} />
      </View>
    </View>
  </View>
);
