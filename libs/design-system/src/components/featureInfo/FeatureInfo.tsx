import { ReactNode } from "react";
import { AccessibilityRole, GestureResponderEvent } from "react-native";
import {
  Body,
  HStack,
  IOIconSizeScale,
  IOIcons,
  IOPictogramSizeScale,
  IOPictogramsProps,
  Icon,
  Pictogram,
  VStack
} from "../../components";
import { useIOTheme } from "../../context";
import { IOColors } from "../../core/IOColors";

type PartialFeatureInfo = {
  // Necessary to render main body with different formatting
  body?: string | ReactNode;
  variant?: "neutral" | "contrast";
};

type FeatureInfoActionProps =
  | {
      action: {
        label: string;
        onPress: (event: GestureResponderEvent) => void;
        accessibilityRole?: Extract<AccessibilityRole, "button" | "link">;
      };
    }
  | {
      action?: never;
    };

type FeatureInfoGraphicProps =
  | {
      iconName?: never;
      pictogramProps: Pick<IOPictogramsProps, "name" | "pictogramStyle">;
    }
  | { iconName: IOIcons; pictogramProps?: never };

type FeatureInfoProps = FeatureInfoGraphicProps &
  PartialFeatureInfo &
  FeatureInfoActionProps;

const DEFAULT_ICON_SIZE: IOIconSizeScale = 24;
const DEFAULT_PICTOGRAM_SIZE: IOPictogramSizeScale = 48;

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
    <HStack style={{ alignItems: "center" }} space={24}>
      {iconName && (
        <Icon
          allowFontScaling
          name={iconName}
          size={DEFAULT_ICON_SIZE}
          color={theme["icon-decorative"]}
        />
      )}
      {pictogramProps && (
        <Pictogram
          {...pictogramProps}
          allowFontScaling
          size={DEFAULT_PICTOGRAM_SIZE}
        />
      )}
      <VStack allowScaleSpacing space={4} style={{ flexShrink: 1 }}>
        <FeatureInfoContent />
        {action && (
          <Body
            asLink
            weight="Semibold"
            onPress={action.onPress}
            color={actionColor}
            accessible
            importantForAccessibility={"yes"}
            accessibilityElementsHidden={false}
            accessibilityRole={accessibilityRole}
          >
            {action.label}
          </Body>
        )}
      </VStack>
    </HStack>
  );
};
