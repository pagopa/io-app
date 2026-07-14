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
import {
  IOColors,
  IOListItemVisualParams,
  IOSpacer,
  IOVisualCostants
} from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { IOIconSizeScale, IOIcons, Icon } from "../icons";
import { HStack, VStack } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
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
  | {
      icon?: never;
      image: ImageURISource | ImageSourcePropType | ReactElement<SvgProps>;
    };

type BaseProps = {
  isLoading?: false;
  title: string;
  subtitle?: string;
  badge?: Badge;
  isFetching?: boolean;
  rightIcon?: IOIcons;
  iconColor?: IOColors;
} & ImageProps &
  PressableModuleBaseProps;

type ModuleNavigationAltProps = LoadingProps | BaseProps;

export const ModuleNavigationAlt = (
  props: WithTestID<ModuleNavigationAltProps>
) => {
  const theme = useIOTheme();
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
    <Icon name={icon} size={32} color={iconColor} />
  );

  const imageComponent = () => {
    if (!image) {
      return null;
    }

    if (isValidElement(image)) {
      return image;
    } else {
      return (
        <View>
          <Image
            source={image as ImageSourcePropType}
            style={styles.image}
            accessibilityIgnoresInvertColors={true}
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
          testID={testID ? `${testID}_icon` : undefined}
          name={rightIcon ?? "chevronRightListItem"}
          color={theme["interactiveElem-default"]}
          size={IOListItemVisualParams.chevronSize}
        />
      );
    }
    return null;
  };

  return (
    <PressableModuleBase {...pressableProps} testID={testID} onPress={onPress}>
      <HStack space={8} style={{ alignItems: "center" }}>
        <HStack
          space={IOVisualCostants.iconMargin as IOSpacer}
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

          <VStack space={8} style={{ flexShrink: 1, alignItems: "flex-start" }}>
            {badge ? <Badge {...badge} /> : null}
            <View>
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
    accessible={true}
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    startBlock={
      <HStack
        style={{ alignItems: "center" }}
        space={IOVisualCostants.iconMargin as IOSpacer}
      >
        <IOSkeleton shape="square" size={32} radius={8} />
        <VStack space={4}>
          <IOSkeleton shape="rectangle" width={52} height={12} radius={8} />
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
    width: "100%",
    height: "auto",
    resizeMode: "contain"
  }
});
