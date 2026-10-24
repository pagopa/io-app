import { ReactNode } from "react";
import { AccessibilityRole, GestureResponderEvent } from "react-native";

import {
  Body,
  HStack,
  Icon,
  IOIcons,
  IOPictogramsProps,
  Pictogram,
  VStack
} from "../../components";
import { useIOTheme } from "../../context";
import { IODimensions } from "../../core";
import { IOColors } from "../../core/IOColors";

type FeatureInfoActionProps =
  | {
      action: {
        accessibilityRole?: Extract<AccessibilityRole, "button" | "link">;
        label: string;
        onPress: (event: GestureResponderEvent) => void;
      };
    }
  | {
      action?: never;
    };

type FeatureInfoGraphicProps =
  | { iconName: IOIcons; pictogramProps?: never }
  | {
      iconName?: never;
      pictogramProps: Pick<IOPictogramsProps, "name" | "pictogramStyle">;
    };

type FeatureInfoProps = FeatureInfoActionProps &
  FeatureInfoGraphicProps &
  PartialFeatureInfo;

type PartialFeatureInfo = {
  // Necessary to render main body with different formatting
  body?: ReactNode | string;
  variant?: "contrast" | "neutral";
};

export const FeatureInfo = ({
  action,
  body,
  iconName,
  pictogramProps,
  variant = "neutral"
}: FeatureInfoProps) => {
  const theme = useIOTheme();

  /* Already defined in the `BodySmall` component as a fallback value,
  but I keep it here to avoid possible future inconsistencies. */
  const accessibilityRole = action?.accessibilityRole ?? "link";

  const variantMap: Record<
    NonNullable<FeatureInfoProps["variant"]>,
    { action: IOColors; content: IOColors }
  > = {
    contrast: {
      action: "white",
      content: "white"
    },
    neutral: {
      action: theme["interactiveElem-default"],
      content: theme["textBody-tertiary"]
    }
  };

  const { action: actionColor, content: contentColor } = variantMap[variant];

  const FeatureInfoContent = () => {
    if (typeof body === "string") {
      return (
        <Body color={contentColor} testID="infoScreenBody">
          {body}
        </Body>
      );
    }

    return <>{body}</>;
  };

  return (
    <HStack
      space={IODimensions.gap.featureInfo.leading}
      style={{ alignItems: "center" }}
    >
      {iconName && (
        <Icon
          allowFontScaling
          color={theme["icon-decorative"]}
          name={iconName}
          size={IODimensions.size.icon.featureInfo}
        />
      )}
      {pictogramProps && (
        <Pictogram
          {...pictogramProps}
          allowFontScaling
          size={IODimensions.size.pictogram.featureInfo}
        />
      )}
      <VStack
        allowScaleSpacing
        space={IODimensions.gap.featureInfo.action}
        style={{ flexShrink: 1 }}
      >
        <FeatureInfoContent />
        {action && (
          <Body
            accessibilityElementsHidden={false}
            accessibilityRole={accessibilityRole}
            accessible
            asLink
            color={actionColor}
            importantForAccessibility={"yes"}
            onPress={action.onPress}
            weight="Semibold"
          >
            {action.label}
          </Body>
        )}
      </VStack>
    </HStack>
  );
};
