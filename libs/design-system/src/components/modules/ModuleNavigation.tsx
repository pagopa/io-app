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
import { IOIcons, Icon } from "../icons";
import { HStack, VStack } from "../layout";
import { IOSkeleton } from "../skeleton";
import { BodySmall, LabelMini } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import {
  PressableModuleBase,
  PressableModuleBaseProps
} from "./PressableModuleBase";

type LoadingProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

type ImageProps =
  | { icon: IOIcons; image?: never }
  | { icon?: never; image: ImageURISource | ImageSourcePropType };

type BaseProps = {
  isLoading?: false;
  title: string;
  subtitle?: string;
  badge?: Badge;
} & ImageProps &
  PressableModuleBaseProps;

type ModuleNavigationProps = LoadingProps | BaseProps;

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
      name={icon}
      size={IOSelectionListItemVisualParams.iconSize}
      color="grey-300"
    />
  );

  const imageComponent = image && (
    <Image
      source={image}
      style={styles.image}
      accessibilityIgnoresInvertColors={true}
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
              weight="Semibold"
              numberOfLines={2}
              lineBreakMode="middle"
              style={{ flexShrink: 1 }}
            >
              {title}
            </BodySmall>
            {subtitle && (
              <LabelMini weight="Regular" color={theme["textBody-tertiary"]}>
                {subtitle}
              </LabelMini>
            )}
          </View>
        </HStack>
        {badge ? (
          <Badge {...badge} />
        ) : onPress ? (
          <Icon
            name="chevronRightListItem"
            color={theme["interactiveElem-default"]}
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
    accessible={true}
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    startBlock={
      <HStack
        style={{ alignItems: "center" }}
        space={IOVisualCostants.iconMargin as IOSpacer}
      >
        <IOSkeleton shape="square" size={24} radius={8} />
        <VStack space={4}>
          <IOSkeleton shape="rectangle" width={96} height={16} radius={8} />
          <IOSkeleton shape="rectangle" width={160} height={12} radius={8} />
        </VStack>
      </HStack>
    }
    endBlock={
      <IOSkeleton shape="rectangle" width={64} height={24} radius={16} />
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
