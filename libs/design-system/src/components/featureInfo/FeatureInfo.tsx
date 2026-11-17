import { ReactNode } from "react";
import { AccessibilityRole, GestureResponderEvent } from "react-native";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
import { Icon, IOIcons } from "../icons";
import { HStack, VStack } from "../layout";
import { IOPictogramsProps, Pictogram } from "../pictograms";
import { Body } from "../typography";

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
};

export const FeatureInfo = ({
  action,
  body,
  iconName,
  pictogramProps
}: FeatureInfoProps) => {
  const colors = useIOColors().component.featureInfo;

  /* Already defined in the `BodySmall` component as a fallback value,
  but I keep it here to avoid possible future inconsistencies. */
  const accessibilityRole = action?.accessibilityRole ?? "link";

  const FeatureInfoContent = () => {
    if (typeof body === "string") {
      return (
        <Body color={colors.content} testID="infoScreenBody">
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
          color={colors.icon}
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
            color={colors.action}
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
