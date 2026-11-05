import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";

import { useIOColors } from "../../context";
import { IODimensions } from "../../core";
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
  const moduleColors = useIOColors().component.module;
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
      color={moduleColors.foreground.icon.decorative}
      name={icon}
      size={IODimensions.size.icon.module.leading}
    />
  );

  const imageComponent = image != null && (
    <Image
      accessibilityIgnoresInvertColors={true}
      source={image}
      style={styles.image}
    />
  );

  return (
    <PressableModuleBase {...pressableProps} onPress={onPress}>
      <HStack
        space={IODimensions.gap.module.trailing}
        style={{ alignItems: "center" }}
      >
        <HStack
          space={IODimensions.gap.module.leading}
          style={{ alignItems: "center", flexGrow: 1, flexShrink: 1 }}
        >
          {iconComponent ?? imageComponent}

          <View style={{ flexShrink: 1 }}>
            <BodySmall
              color={moduleColors.foreground.action}
              numberOfLines={2}
              style={{ flexShrink: 1 }}
              weight="Semibold"
            >
              {title}
            </BodySmall>
            {subtitle && (
              <LabelMini
                color={moduleColors.foreground.description}
                weight="Regular"
              >
                {subtitle}
              </LabelMini>
            )}
          </View>
        </HStack>
        {badge ? (
          <Badge {...badge} />
        ) : onPress ? (
          <Icon
            color={moduleColors.foreground.icon.action}
            name="chevronRightListItem"
            size={IODimensions.size.icon.chevron}
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
        space={IODimensions.gap.module.leading}
        style={{ alignItems: "center" }}
      >
        <IOSkeleton
          radius={IODimensions.radius.default}
          shape="square"
          size={IODimensions.size.icon.module.leading}
        />
        <VStack space={4}>
          <IOSkeleton
            height={16}
            radius={IODimensions.radius.default}
            shape="rectangle"
            width={96}
          />
          <IOSkeleton
            height={12}
            radius={IODimensions.radius.default}
            shape="rectangle"
            width={160}
          />
        </VStack>
      </HStack>
    }
  />
);

const styles = StyleSheet.create({
  image: {
    width: IODimensions.size.icon.module.leading,
    height: IODimensions.size.icon.module.leading,
    resizeMode: "contain"
  }
});
