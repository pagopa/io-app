import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";

import { useIOTheme } from "../../context";
import {
  IOListItemVisualParams,
  IOSelectionListItemVisualParams,
  IOSpacer,
  IOVisualCostants
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon, IOIcons } from "../icons";
import { HStack, VStack } from "../layout";
import { IOSkeleton } from "../skeleton";
import { BodySmall, LabelMini } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import {
  PressableModuleBase,
  PressableModuleBaseProps
} from "./PressableModuleBase";

type BaseProps = ImageProps &
  PressableModuleBaseProps & {
    badge?: Badge;
    isLoading?: false;
    subtitle?: string;
    title: string;
  };

type ImageProps =
  | { icon: IOIcons; image?: never }
  | { icon?: never; image: ImageSourcePropType | ImageURISource };

type LoadingProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

type ModuleNavigationProps = BaseProps | LoadingProps;

export const ModuleNavigation = (props: WithTestID<ModuleNavigationProps>) => {
  const theme = useIOTheme();
  const { hugeFontEnabled } = useIOFontDynamicScale();

  if (props.isLoading) {
    return (
      <ModuleNavigationSkeleton
        loadingAccessibilityLabel={props.loadingAccessibilityLabel}
      />
    );
  }

  const { icon, image, title, subtitle, onPress, badge, ...pressableProps } =
    props;

  const iconComponent = icon && !hugeFontEnabled && (
    <Icon
      color="grey-300"
      name={icon}
      size={IOSelectionListItemVisualParams.iconSize}
    />
  );

  const imageComponent = image && (
    <Image
      accessibilityIgnoresInvertColors={true}
      source={image}
      style={styles.image}
    />
  );

  return (
    <PressableModuleBase {...pressableProps} onPress={onPress}>
      <HStack space={8} style={{ alignItems: "center" }}>
        <HStack
          space={IOVisualCostants.iconMargin as IOSpacer}
          style={{ alignItems: "center", flexGrow: 1, flexShrink: 1 }}
        >
          {iconComponent ?? imageComponent}

          <View style={{ flexShrink: 1 }}>
            <BodySmall
              color={theme["interactiveElem-default"]}
              lineBreakMode="middle"
              numberOfLines={2}
              style={{ flexShrink: 1 }}
              weight="Semibold"
            >
              {title}
            </BodySmall>
            {subtitle && (
              <LabelMini color={theme["textBody-tertiary"]} weight="Regular">
                {subtitle}
              </LabelMini>
            )}
          </View>
        </HStack>
        {badge ? (
          <Badge {...badge} />
        ) : onPress ? (
          <Icon
            color={theme["interactiveElem-default"]}
            name="chevronRightListItem"
            size={IOListItemVisualParams.chevronSize}
          />
        ) : null}
      </HStack>
    </PressableModuleBase>
  );
};

const ModuleNavigationSkeleton = ({
  loadingAccessibilityLabel
}: Pick<LoadingProps, "loadingAccessibilityLabel">) => (
  <ModuleStatic
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    accessible={true}
    endBlock={
      <IOSkeleton height={24} radius={16} shape="rectangle" width={64} />
    }
    startBlock={
      <HStack
        space={IOVisualCostants.iconMargin as IOSpacer}
        style={{ alignItems: "center" }}
      >
        <IOSkeleton radius={8} shape="square" size={24} />
        <VStack space={4}>
          <IOSkeleton height={16} radius={8} shape="rectangle" width={96} />
          <IOSkeleton height={12} radius={8} shape="rectangle" width={160} />
        </VStack>
      </HStack>
    }
  />
);

const styles = StyleSheet.create({
  image: {
    width: IOSelectionListItemVisualParams.iconSize,
    height: IOSelectionListItemVisualParams.iconSize,
    resizeMode: "contain"
  }
});
