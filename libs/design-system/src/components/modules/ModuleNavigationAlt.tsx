import { isValidElement, ReactElement } from "react";
import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";
import { SvgProps } from "react-native-svg";

import { useIOColors } from "../../context";
import { IODimensions, IORoleColor } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon, IOIcons, IOIconSizeScale } from "../icons";
import { HStack, VStack } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
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
    /* A semantic token: it has a value in both modes */
    iconColor?: IORoleColor<"foreground">;
    isFetching?: boolean;
    isLoading?: false;
    rightIcon?: IOIcons;
    subtitle?: string;
    title: string;
  };

type ImageProps =
  | { icon: IOIcons; image?: never }
  | {
      icon?: never;
      image: ImageSourcePropType | ImageURISource | ReactElement<SvgProps>;
    };

type LoadingProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

type ModuleNavigationAltProps = BaseProps | LoadingProps;

export const ModuleNavigationAlt = (
  props: WithTestID<ModuleNavigationAltProps>
) => {
  const moduleColors = useIOColors().component.module;
  const { hugeFontEnabled } = useIOFontDynamicScale();

  const graphicWrapperSize: IOIconSizeScale = 48;

  if (props.isLoading) {
    return (
      <ModuleNavigationAltSkeleton
        loadingAccessibilityLabel={props.loadingAccessibilityLabel}
      />
    );
  }

  const {
    testID,
    icon,
    iconColor = moduleColors.foreground.icon.action,
    image,
    title,
    subtitle,
    onPress,
    badge,
    isFetching,
    rightIcon,
    ...pressableProps
  } = props;

  const iconComponent = icon && (
    <Icon color={iconColor} name={icon} size={32} />
  );

  const imageComponent = () => {
    if (image == null) {
      return null;
    }

    if (isValidElement(image)) {
      return image;
    } else {
      return (
        <View>
          <Image
            accessibilityIgnoresInvertColors={true}
            source={image as ImageSourcePropType}
            style={styles.image}
          />
        </View>
      );
    }
  };

  const endComponent = () => {
    if (isFetching) {
      return (
        <LoadingSpinner
          testID={testID ? `${testID}_activityIndicator` : undefined}
        />
      );
    }
    if (onPress) {
      return (
        <Icon
          color={moduleColors.foreground.icon.action}
          name={rightIcon ?? "chevronRightListItem"}
          size={IODimensions.size.icon.chevron}
          testID={testID ? `${testID}_icon` : undefined}
        />
      );
    }
    return null;
  };

  return (
    <PressableModuleBase {...pressableProps} onPress={onPress} testID={testID}>
      <HStack
        space={IODimensions.gap.module.trailing}
        style={{ alignItems: "center" }}
      >
        <HStack
          space={IODimensions.gap.module.leading}
          style={{ alignItems: "center", flexGrow: 1, flexShrink: 1 }}
        >
          {!hugeFontEnabled && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                width: graphicWrapperSize,
                height: graphicWrapperSize
              }}
            >
              {iconComponent ?? imageComponent()}
            </View>
          )}

          <VStack
            space={IODimensions.gap.module.topElement}
            style={{ flexShrink: 1, alignItems: "flex-start" }}
          >
            {badge ? <Badge {...badge} /> : null}
            <View>
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
          </VStack>
        </HStack>
        {endComponent()}
      </HStack>
    </PressableModuleBase>
  );
};

const ModuleNavigationAltSkeleton = ({
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
          size={32}
        />
        <VStack space={4}>
          <IOSkeleton
            height={12}
            radius={IODimensions.radius.default}
            shape="rectangle"
            width={52}
          />
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
    width: "100%",
    height: "auto",
    resizeMode: "contain"
  }
});
