import { ComponentProps, ReactNode } from "react";
import { AccessibilityRole, Pressable, View } from "react-native";
import Animated from "react-native-reanimated";

import { useIOTheme } from "../../context";
import { IOListItemStyles, IOListItemVisualParams } from "../../core";
import { useListItemAnimation } from "../../hooks";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { IconButton, IOButton, IOButtonLinkSpecificProps } from "../buttons";
import { LogoPaymentWithFallback } from "../common/LogoPaymentWithFallback";
import { Icon, IOIcons, IOIconSizeScale } from "../icons";
import { VSpacer } from "../layout";
import { IOLogoPaymentType } from "../logos";
import { BodySmall, H6 } from "../typography";

export type ListItemInfo = GraphicProps &
  InteractiveProps &
  WithTestID<{
    accessibilityLabel?: string;
    accessibilityRole?: AccessibilityRole;
    endElement?: EndElementProps;
    label?: string;
    numberOfLines?: number;
    reversed?: boolean;
    topElement?: BadgeProps;
    value: ReactNode | string;
  }>;

type BadgeProps = {
  componentProps: ComponentProps<typeof Badge>;
  type: "badge";
};

type ButtonLinkActionProps = {
  componentProps: Omit<IOButtonLinkSpecificProps, "variant">;
  type: "buttonLink";
};

type EndElementProps =
  | BadgeProps
  | ButtonLinkActionProps
  | IconButtonActionProps;

type GraphicProps =
  | { icon?: IOIcons; paymentLogoIcon?: never }
  | { icon?: never; paymentLogoIcon?: IOLogoPaymentType };

type IconButtonActionProps = {
  componentProps: ComponentProps<typeof IconButton>;
  type: "iconButton";
};

type InteractiveProps = Pick<
  ComponentProps<typeof Pressable>,
  "accessibilityActions" | "onAccessibilityAction" | "onLongPress"
>;

const PAYMENT_LOGO_SIZE: IOIconSizeScale = 24;

const EndElementComponent = ({ type, componentProps }: EndElementProps) => {
  switch (type) {
    case "badge":
      return <Badge {...componentProps} />;
    case "buttonLink":
      return (
        <IOButton
          variant="link"
          {...componentProps}
          accessibilityLabel={
            componentProps.accessibilityLabel ?? componentProps.label
          }
        />
      );
    case "iconButton":
      return (
        <IconButton
          {...componentProps}
          accessibilityLabel={componentProps.accessibilityLabel}
        />
      );
    default:
      return null;
  }
};

const ListItemInfoContent = ({
  icon,
  paymentLogoIcon,
  label,
  value,
  numberOfLines,
  reversed,
  topElement,
  endElement,
  hasInteractiveElements,
  listItemAccessibilityLabel
}: Pick<
  ListItemInfo,
  | "endElement"
  | "icon"
  | "label"
  | "numberOfLines"
  | "paymentLogoIcon"
  | "reversed"
  | "topElement"
  | "value"
> & {
  hasInteractiveElements: boolean;
  listItemAccessibilityLabel?: string;
}) => {
  const theme = useIOTheme();
  const { hugeFontEnabled } = useIOFontDynamicScale();

  return (
    <>
      {icon && !hugeFontEnabled && (
        <Icon
          allowFontScaling
          color={theme["icon-decorative"]}
          name={icon}
          size={IOListItemVisualParams.iconSize}
        />
      )}

      {paymentLogoIcon && (
        <LogoPaymentWithFallback
          brand={paymentLogoIcon}
          size={PAYMENT_LOGO_SIZE}
        />
      )}

      <View style={{ flex: 1 }}>
        <View
          accessibilityLabel={
            hasInteractiveElements ? listItemAccessibilityLabel : undefined
          }
          accessible={hasInteractiveElements}
          importantForAccessibility={
            hasInteractiveElements ? "yes" : "no-hide-descendants"
          }
          style={{ flexDirection: reversed ? "column-reverse" : "column" }}
        >
          {topElement?.type === "badge" && (
            <View style={{ alignSelf: "flex-start" }}>
              <Badge {...topElement.componentProps} />
              <VSpacer size={4} />
            </View>
          )}

          {label && (
            <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
              {label}
            </BodySmall>
          )}

          {typeof value === "string" ? (
            <H6 color={theme["textBody-default"]} numberOfLines={numberOfLines}>
              {value}
            </H6>
          ) : (
            value
          )}
        </View>
      </View>

      {endElement && (
        <View
          accessible={false}
          importantForAccessibility={
            hasInteractiveElements ? "auto" : "no-hide-descendants"
          }
        >
          <EndElementComponent {...endElement} />
        </View>
      )}
    </>
  );
};

/**
 * ListItemInfo component displays information in a list item format with optional icons,
 * labels, values, and end elements (buttons, badges).
 *
 * @remarks
 * **Accessibility for Interactive Elements:**
 * When using interactive end elements (`buttonLink` or `iconButton`), you must provide
 * an appropriate `accessibilityLabel` directly to the interactive component props.
 * This ensures that screen reader users can understand the relationship between the
 * list item content and the action that the interactive element triggers.
 *
 * Example:
 * ```tsx
 * <ListItemInfo
 *   label="Email"
 *   value="user@example.com"
 *   endElement={{
 *     type: "buttonLink",
 *     componentProps: {
 *       label: "Edit",
 *       accessibilityLabel: "Edit email address"
 *     }
 *   }}
 * />
 * ```
 *
 * The design system cannot enforce this pattern automatically, so it's the responsibility
 * of the implementing software engineer to ensure proper accessibility labels are set.
 */
export const ListItemInfo = ({
  value,
  label,
  numberOfLines = 2,
  reversed = false,
  icon,
  paymentLogoIcon,
  endElement,
  topElement,
  accessibilityLabel,
  accessibilityRole,
  accessibilityActions,
  onAccessibilityAction,
  onLongPress,
  testID
}: ListItemInfo) => {
  const { dynamicFontScale, spacingScaleMultiplier } = useIOFontDynamicScale();

  const { onPressIn, onPressOut, scaleAnimatedStyle, backgroundAnimatedStyle } =
    useListItemAnimation();

  /**
   * A11Y Support: Two different combinations based on interactive elements
   *
   * 1. NO interactive elements (or just badge):
   *    - The outer container is accessible and receives the complete accessibility label
   *    - This allows the entire list item to be treated as a single accessibility element
   *
   * 2. WITH interactive elements (buttonLink or iconButton):
   *    - The outer container is NOT accessible
   *    - The inner content becomes accessible with its label
   *    - The interactive element is separately accessible with its own label
   *    - This allows screen readers to navigate between the content and the action separately
   */
  const hasInteractiveElements =
    endElement?.type === "buttonLink" || endElement?.type === "iconButton";

  const componentValueToAccessibility = typeof value === "string" ? value : "";

  const topBadgeText =
    topElement?.type === "badge" ? (topElement.componentProps.text ?? "") : "";

  const endBadgeText =
    endElement?.type === "badge" ? (endElement.componentProps.text ?? "") : "";

  /**
   * Build text in VISUAL ORDER
   */
  const mainTextParts = reversed
    ? [componentValueToAccessibility, label]
    : [label, componentValueToAccessibility];

  const textParts = [topBadgeText, ...mainTextParts, endBadgeText];

  const listItemAccessibilityLabel =
    accessibilityLabel ?? textParts.filter(Boolean).join("; ");

  const contentProps = {
    icon,
    paymentLogoIcon,
    label,
    value,
    numberOfLines,
    reversed,
    topElement,
    endElement,
    hasInteractiveElements,
    listItemAccessibilityLabel
  } as const;

  if (onLongPress) {
    return (
      <Pressable
        accessibilityActions={accessibilityActions}
        accessibilityLabel={listItemAccessibilityLabel}
        accessibilityRole="button"
        accessible
        onAccessibilityAction={onAccessibilityAction}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onTouchEnd={onPressOut}
        testID={testID}
      >
        <Animated.View
          style={[IOListItemStyles.listItem, backgroundAnimatedStyle]}
        >
          <Animated.View
            style={[
              IOListItemStyles.listItemInner,
              {
                columnGap:
                  IOListItemVisualParams.iconMargin *
                  dynamicFontScale *
                  spacingScaleMultiplier
              },
              scaleAnimatedStyle
            ]}
          >
            <ListItemInfoContent {...contentProps} />
          </Animated.View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View
      accessibilityLabel={
        hasInteractiveElements ? undefined : listItemAccessibilityLabel
      }
      accessibilityRole={hasInteractiveElements ? undefined : accessibilityRole}
      accessible={!hasInteractiveElements}
      style={IOListItemStyles.listItem}
      testID={testID}
    >
      <View
        style={[
          IOListItemStyles.listItemInner,
          {
            columnGap:
              IOListItemVisualParams.iconMargin *
              dynamicFontScale *
              spacingScaleMultiplier
          }
        ]}
      >
        <ListItemInfoContent {...contentProps} />
      </View>
    </View>
  );
};
