import { ComponentProps, memo, useMemo } from "react";
import { GestureResponderEvent, Platform, Switch, View } from "react-native";

import { useIOTheme } from "../../context";
import {
  IOSelectionListItemStyles,
  IOSelectionListItemVisualParams
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon, IOIcons } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
import { IOLogoPaymentType, LogoPayment } from "../logos";
import { NativeSwitch } from "../switch/NativeSwitch";
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

const DISABLED_OPACITY = 0.5;

/* Estimated height of the native switch component,
both on iOS & Android */
const ESTIMATED_SWITCH_HEIGHT = 32;

export type ListItemSwitchProps = ListItemSwitchGraphicProps &
  PartialProps &
  Pick<ComponentProps<typeof Switch>, "disabled" | "value">;

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
    const theme = useIOTheme();
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
            opacity: disabled ? DISABLED_OPACITY : 1
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
                IOSelectionListItemVisualParams.iconMargin *
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
                color={theme["icon-decorative"]}
                name={icon}
                size={IOSelectionListItemVisualParams.iconSize}
              />
            )}
            {paymentLogo && (
              <LogoPayment
                name={paymentLogo}
                size={IOSelectionListItemVisualParams.iconSize}
              />
            )}

            <H6
              accessible={!canRenderSwitch}
              color={theme["textBody-default"]}
              importantForAccessibility={
                !canRenderSwitch ? "yes" : "no-hide-descendants"
              }
              style={{ flex: 1 }}
            >
              {label}
            </H6>
          </View>
          <HSpacer size={8} />
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
              <NativeSwitch
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
            <VSpacer size={IOSelectionListItemVisualParams.descriptionMargin} />
            <BodySmall color={theme["textBody-tertiary"]} weight="Regular">
              {description}
            </BodySmall>
          </>
        )}
        {action && (
          <>
            <VSpacer size={IOSelectionListItemVisualParams.actionMargin} />
            <LabelMini asLink onPress={action.onPress}>
              {action.label}
            </LabelMini>
          </>
        )}
      </View>
    );
  }
);
