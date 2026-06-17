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
import { IOIcons, Icon } from "../icons";
import { HSpacer, VSpacer } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
import { IOLogoPaymentType, LogoPayment } from "../logos";
import { NativeSwitch } from "../switch/NativeSwitch";
import { BodySmall, H6, LabelMini } from "../typography";

type PartialProps = WithTestID<{
  label: string;
  onSwitchValueChange?: (newValue: boolean) => void;
  description?: string;
  action?: SwitchAction;
  isLoading?: boolean;
  badge?: Badge;
  switchTestID?: string;
}>;

export type SwitchAction = {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
};

export type ListItemSwitchGraphicProps =
  | { icon?: never; paymentLogo: IOLogoPaymentType }
  | { icon: IOIcons; paymentLogo?: never }
  | { icon?: never; paymentLogo?: never };

const DISABLED_OPACITY = 0.5;

/* Estimated height of the native switch component,
both on iOS & Android */
const ESTIMATED_SWITCH_HEIGHT: number = 32;

export type ListItemSwitchProps = PartialProps &
  ListItemSwitchGraphicProps &
  Pick<ComponentProps<typeof Switch>, "value" | "disabled">;

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
        testID={testID ?? "ListItemSwitch"}
        style={[
          IOSelectionListItemStyles.listItem,
          {
            opacity: disabled ? DISABLED_OPACITY : 1
          }
        ]}
        pointerEvents={disabled ? "none" : "auto"}
        needsOffscreenAlphaCompositing={true}
        accessible={false}
      >
        <View
          style={[
            IOSelectionListItemStyles.listItemInner,
            { alignItems: "center" }
          ]}
          accessible={false}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: icon ? "flex-start" : "center",
              columnGap:
                IOSelectionListItemVisualParams.iconMargin *
                dynamicFontScale *
                spacingScaleMultiplier
            }}
            accessible={!canRenderSwitch}
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
                name={icon}
                color={theme["icon-decorative"]}
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
              color={theme["textBody-default"]}
              style={{ flex: 1 }}
              accessible={!canRenderSwitch}
              importantForAccessibility={
                !canRenderSwitch ? "yes" : "no-hide-descendants"
              }
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
                text={badge.text}
                variant={badge.variant}
                testID={badge.testID}
              />
            )}
            {isLoading && <LoadingSpinner size={24} />}
            {canRenderSwitch && (
              <NativeSwitch
                value={value}
                accessibilityLabel={label}
                disabled={disabled}
                onValueChange={onSwitchValueChange}
                testID={switchTestID}
              />
            )}
          </View>
        </View>
        {description && (
          <>
            <VSpacer size={IOSelectionListItemVisualParams.descriptionMargin} />
            <BodySmall weight="Regular" color={theme["textBody-tertiary"]}>
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
