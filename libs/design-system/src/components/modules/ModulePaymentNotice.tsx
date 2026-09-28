import { GestureResponderEvent, StyleSheet, View } from "react-native";

import { useIOTheme } from "../../context";
import { IOListItemVisualParams, IOSpacer } from "../../core";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon } from "../icons";
import { HStack, VStack } from "../layout";
import { IOSkeleton } from "../skeleton";
import { Body, BodySmall, H6 } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import { PressableModuleBase } from "./PressableModuleBase";

export type ModulePaymentNoticeProps = WithTestID<
  {
    accessibilityLabel?: string;
    isLoading?: boolean;
    loadingAccessibilityLabel?: string;
    onPress: (event: GestureResponderEvent) => void;
    subtitle: string;
    title?: string;
  } & (
    | {
        badgeText: string;
        paymentNotice: {
          amount?: string;
          amountAccessibilityLabel?: string;
          status: Exclude<PaymentNoticeStatus, "default">;
        };
      }
    | {
        badgeText?: never;
        paymentNotice: {
          amount: string;
          amountAccessibilityLabel: string;
          status: Extract<PaymentNoticeStatus, "default">;
        };
      }
  )
>;

export type PaymentNoticeStatus =
  | "canceled"
  | "default"
  | "error"
  | "expired"
  | "in-progress"
  | "paid"
  | "revoked";

const styles = StyleSheet.create({
  endBlock: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end"
  }
});

const AmountOrBadgeComponent = ({
  status,
  amount,
  amountAccessibilityLabel,
  badgeText
}: {
  amount: string | undefined;
  amountAccessibilityLabel: string | undefined;
  badgeText: string;
  status: PaymentNoticeStatus;
}) => {
  const theme = useIOTheme();

  switch (status) {
    case "canceled":
    case "expired":
    case "in-progress":
    case "revoked":
      return <Badge text={badgeText} variant="default" />;
    case "default":
      return (
        <H6
          accessibilityLabel={amountAccessibilityLabel}
          color={theme["interactiveElem-default"]}
          numberOfLines={1}
        >
          {amount}
        </H6>
      );
    case "error":
      return <Badge text={badgeText} variant="error" />;
    case "paid":
      return <Badge text={badgeText} variant="success" />;
  }
};

const ModulePaymentNoticeContent = ({
  title,
  subtitle,
  paymentNotice: { status, amount, amountAccessibilityLabel },
  badgeText = ""
}: Omit<ModulePaymentNoticeProps, "isLoading" | "onPress" | "testID">) => {
  const theme = useIOTheme();

  return (
    <HStack space={IOListItemVisualParams.iconMargin as IOSpacer}>
      <View style={{ flexGrow: 1, flexShrink: 1 }}>
        {title && (
          <BodySmall
            color={theme["textBody-tertiary"]}
            numberOfLines={1}
            weight="Regular"
          >
            {title}
          </BodySmall>
        )}
        {subtitle && (
          <Body
            color={theme["interactiveElem-default"]}
            numberOfLines={2}
            weight="Semibold"
          >
            {subtitle}
          </Body>
        )}
      </View>
      <View style={styles.endBlock}>
        <AmountOrBadgeComponent
          amount={amount}
          amountAccessibilityLabel={amountAccessibilityLabel}
          badgeText={badgeText}
          status={status}
        />
        <Icon
          color={theme["interactiveElem-default"]}
          name="chevronRightListItem"
          size={IOListItemVisualParams.chevronSize}
        />
      </View>
    </HStack>
  );
};

/**
 * The `ModulePaymentNotice` component is a custom button component with an
 * extended outline style. It provides an animated scaling effect when pressed.
 *
 * @param {boolean} isLoading - If true, displays a skeleton loading component.
 * @param {function} onPress - The function to be executed when the item is
 *   pressed.
 * @param {string} title - The title text to display.
 * @param {string} subtitle - The subtitle text to display.
 * @param {string} testID - The test ID for testing purposes.
 * @param {string} paymentNoticeAmount - The payment notice amount to display.
 * @param {string} paymentNoticeStatus - The status of the payment notice.
 */
export const ModulePaymentNotice = ({
  isLoading = false,
  testID,
  accessibilityLabel,
  onPress,
  loadingAccessibilityLabel,
  ...rest
}: ModulePaymentNoticeProps) => {
  if (isLoading) {
    return (
      <ModulePaymentNoticeSkeleton
        loadingAccessibilityLabel={loadingAccessibilityLabel}
      />
    );
  }

  return (
    <PressableModuleBase
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      testID={testID}
    >
      <ModulePaymentNoticeContent {...rest} />
    </PressableModuleBase>
  );
};

const ModulePaymentNoticeSkeleton = ({
  loadingAccessibilityLabel
}: Pick<ModulePaymentNoticeProps, "loadingAccessibilityLabel">) => (
  <ModuleStatic
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    accessible={true}
    endBlock={
      <IOSkeleton height={24} radius={16} shape="rectangle" width={64} />
    }
    startBlock={
      <VStack space={4}>
        <IOSkeleton height={12} radius={8} shape="rectangle" width={120} />
        <IOSkeleton height={16} radius={8} shape="rectangle" width={180} />
      </VStack>
    }
  />
);
