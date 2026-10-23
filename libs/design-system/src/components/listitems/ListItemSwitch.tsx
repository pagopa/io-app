import { ComponentProps, memo, useMemo } from "react";
import {
  GestureResponderEvent,
  Platform,
  Switch as RNSwitch,
  View
} from "react-native";

import { useIOColors } from "../../context";
import { IODimensions, IOOpacity, IOSelectionListItemStyles } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon, IOIcons } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
import { IOLogoPaymentType, LogoPayment } from "../logos";
import { Switch } from "../switch/Switch";
import { BodySmall, H6, LabelMini } from "../typography";

export type ListItemSwitchGraphicProps =
  | { icon: IOIcons; paymentLogo?: never }
  | { icon?: never; paymentLogo: IOLogoPaymentType }
  | { icon?: never; paymentLogo?: never };

export type SwitchAction = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
};

type PartialProps = WithTestID<{
  action?: SwitchAction;
  badge?: Badge;
  description?: string;
  isLoading?: boolean;
  label: string;
  onSwitchValueChange?: (newValue: boolean) => void;
  switchTestID?: string;
}>;

/* Estimated height of the native switch component,
both on iOS & Android */
const ESTIMATED_SWITCH_HEIGHT = 32;

export type ListItemSwitchProps = ListItemSwitchGraphicProps &
  PartialProps &
  Pick<ComponentProps<typeof RNSwitch>, "disabled" | "value">;

export const ListItemSwitch = memo(
  ({
    label,
    description,
    icon,
    paymentLogo,
    value = false,
    disabled,
    action,
    isLoading,
    badge,
    onSwitchValueChange,
    switchTestID,
    testID
  }: ListItemSwitchProps) => {
    const listItemColors = useIOColors().component.listItem;
    const { dynamicFontScale, spacingScaleMultiplier, hugeFontEnabled } =
      useIOFontDynamicScale();

    // If we have a badge or we are loading, we can't render the switch
    // this affects the accessibility tree and the rendering of the component
    const canRenderSwitch = useMemo(
      () => !isLoading && !badge,
      [isLoading, badge]
    );

    return (
      <View
        accessible={false}
        needsOffscreenAlphaCompositing={true}
        pointerEvents={disabled ? "none" : "auto"}
        style={[
          IOSelectionListItemStyles.listItem,
          {
            opacity: disabled ? IOOpacity.disabled : 1
          }
        ]}
        testID={testID ?? "ListItemSwitch"}
      >
        <View
          accessible={false}
          style={[
            IOSelectionListItemStyles.listItemInner,
            { alignItems: "center" }
          ]}
        >
          <View
            accessible={!canRenderSwitch}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: icon ? "flex-start" : "center",
              columnGap:
                IODimensions.gap.selection.leading *
                dynamicFontScale *
                spacingScaleMultiplier
            }}
            {...Platform.select({
              android: {
                importantForAccessibility: !canRenderSwitch
                  ? "yes"
                  : "no-hide-descendants"
              }
            })}
            accessibilityState={{ disabled }}
          >
            {icon && !hugeFontEnabled && (
              <Icon
                allowFontScaling
                color={listItemColors.icon}
                name={icon}
                size={IODimensions.size.icon.selection}
              />
            )}
            {paymentLogo && (
              <LogoPayment
                name={paymentLogo}
                size={IODimensions.size.icon.selection}
              />
            )}

            <H6
              accessible={!canRenderSwitch}
              color={listItemColors.label}
              importantForAccessibility={
                !canRenderSwitch ? "yes" : "no-hide-descendants"
              }
              style={{ flex: 1 }}
            >
              {label}
            </H6>
          </View>
          <HSpacer size={IODimensions.gap.selection.control} />
          <View
            style={{
              justifyContent: "center",
              alignSelf: "flex-start",
              minHeight: ESTIMATED_SWITCH_HEIGHT
            }}
          >
            {badge && (
              <Badge
                testID={badge.testID}
                text={badge.text}
                variant={badge.variant}
              />
            )}
            {isLoading && <LoadingSpinner size={24} />}
            {canRenderSwitch && (
              <Switch
                accessibilityLabel={label}
                disabled={disabled}
                onValueChange={onSwitchValueChange}
                testID={switchTestID}
                value={value}
              />
            )}
          </View>
        </View>
        {description && (
          <>
            <VSpacer size={IODimensions.gap.selection.description} />
            <BodySmall color={listItemColors.description} weight="Regular">
              {description}
            </BodySmall>
          </>
        )}
        {action && (
          <>
            <VSpacer size={IODimensions.gap.selection.action} />
            <LabelMini asLink onPress={action.onPress}>
              {action.label}
            </LabelMini>
          </>
        )}
      </View>
    );
  }
);
