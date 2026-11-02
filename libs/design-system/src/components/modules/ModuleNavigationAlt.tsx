import { isValidElement, ReactElement } from "react";
import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet,
  View
} from "react-native";
import { SvgProps } from "react-native-svg";

import { useIOTheme } from "../../context";
import { IOColors, IODimensions, IOTypography } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon, IOIcons } from "../icons";
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
    iconColor?: IOColors;
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
  const theme = useIOTheme();
  const { hugeFontEnabled } = useIOFontDynamicScale();

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
    iconColor = theme["interactiveElem-default"],
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
    <Icon
      color={iconColor}
      name={icon}
      size={IODimensions.size.icon.module.large}
    />
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
          color={theme["interactiveElem-default"]}
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
                width: IODimensions.size.module.graphic,
                height: IODimensions.size.module.graphic
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
                color={theme["interactiveElem-default"]}
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
    startBlock={
      <HStack
        space={IODimensions.gap.module.leading}
        style={{ alignItems: "center" }}
      >
        <IOSkeleton
          radius={IODimensions.radius.skeleton.graphic}
          shape="square"
          size={IODimensions.size.module.graphic}
        />
        <VStack space={IODimensions.gap.skeleton.items}>
          <IOSkeleton
            height={IOTypography.bodySmall.size}
            radius={IODimensions.radius.skeleton.text}
            shape="rectangle"
            width={96}
          />
          <IOSkeleton
            height={IOTypography.labelMini.size}
            radius={IODimensions.radius.skeleton.text}
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
    width: IODimensions.size.module.graphic,
    height: IODimensions.size.module.graphic,
    resizeMode: "contain"
  }
});
