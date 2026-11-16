import { ReactNode, useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet
} from "react-native";

import { useIOColors } from "../../context";
import { IODimensions, IOTypography } from "../../core";
import { useIOFontDynamicScale } from "../../utils/accessibility";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon, IOIcons } from "../icons";
import { HSpacer } from "../layout";
import { HStack } from "../layout/Stack";
import { LoadingSpinner } from "../loadingSpinner";
import { IOSkeleton } from "../skeleton";
import { BodySmall } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import {
  PressableModuleBase,
  PressableModuleBaseProps
} from "./PressableModuleBase";

type BaseModuleProps = {
  badge?: Badge;
  isFetching?: boolean;
  isLoading?: false;
  label: string;
};

type ImageProps =
  | { icon: IOIcons; image?: never }
  | { icon?: never; image: ImageSourcePropType | ImageURISource }
  | { icon?: never; image?: never };

type LoadingModuleProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

type ModuleCredentialProps = BaseModuleProps &
  ImageProps &
  PressableModuleBaseProps;

const ModuleCredential = (
  props: WithTestID<LoadingModuleProps | ModuleCredentialProps>
) =>
  props.isLoading ? (
    <ModuleCredentialSkeleton
      loadingAccessibilityLabel={props.loadingAccessibilityLabel}
    />
  ) : (
    <ModuleCredentialContent {...props} />
  );

const ModuleContent = ({
  icon,
  image,
  label,
  endComponent
}: Pick<BaseModuleProps, "label"> &
  Pick<ImageProps, "icon" | "image"> & {
    endComponent: ReactNode;
  }) => {
  const moduleColors = useIOColors().component.module;
  const { hugeFontEnabled } = useIOFontDynamicScale();

  return (
    <HStack
      space={IODimensions.gap.module.trailing}
      style={{ alignItems: "center" }}
    >
      <HStack
        space={IODimensions.gap.module.leading}
        style={{ flexGrow: 1, flexShrink: 1, alignItems: "center" }}
      >
        {/* Graphical assets */}
        {icon && !hugeFontEnabled ? (
          <Icon
            allowFontScaling
            color={moduleColors.foreground.icon.decorative}
            name={icon}
            size={IODimensions.size.icon.module.default}
          />
        ) : (
          image != null && (
            <Image
              accessibilityIgnoresInvertColors={true}
              source={image}
              style={styles.image}
            />
          )
        )}

        <BodySmall
          color={moduleColors.foreground.action}
          numberOfLines={2}
          style={{ flexShrink: 1 }}
          weight="Semibold"
        >
          {label}
        </BodySmall>
      </HStack>
      {endComponent}
    </HStack>
  );
};

const ModuleCredentialContent = ({
  testID,
  icon,
  image,
  label,
  onPress,
  badge,
  isFetching,
  ...pressableProps
}: WithTestID<ModuleCredentialProps>) => {
  const moduleColors = useIOColors().component.module;

  const endComponent = useMemo(() => {
    const activityIndicatorTestID = testID
      ? `${testID}_activityIndicator`
      : undefined;
    const chevronTestID = testID ? `${testID}_icon` : undefined;
    const badgeTestID = testID ? `${testID}_badge` : undefined;

    return badge || onPress ? (
      <HStack style={{ alignItems: "center" }}>
        {badge && <Badge {...badge} testID={badgeTestID} />}
        {onPress &&
          (isFetching ? (
            <>
              {/* The chevron glyph has built-in side bearing, the spinner does not */}
              <HSpacer size={IODimensions.gap.module.trailing} />
              <LoadingSpinner testID={activityIndicatorTestID} />
            </>
          ) : (
            <Icon
              color={moduleColors.foreground.icon.action}
              name="chevronRightListItem"
              size={IODimensions.size.icon.chevron}
              testID={chevronTestID}
            />
          ))}
      </HStack>
    ) : null;
  }, [testID, moduleColors, isFetching, badge, onPress]);

  return onPress ? (
    <PressableModuleBase {...pressableProps} onPress={onPress} testID={testID}>
      <ModuleContent
        endComponent={endComponent}
        icon={icon}
        image={image}
        label={label}
      />
    </PressableModuleBase>
  ) : (
    <ModuleStatic>
      <ModuleContent
        endComponent={endComponent}
        icon={icon}
        image={image}
        label={label}
      />
    </ModuleStatic>
  );
};

const ModuleCredentialSkeleton = ({
  loadingAccessibilityLabel
}: Pick<LoadingModuleProps, "loadingAccessibilityLabel">) => (
  <ModuleStatic
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    accessible={true}
    endBlock={
      <IOSkeleton
        height={IODimensions.height.badge}
        radius={IODimensions.radius.badge}
        shape="rectangle"
        width={64}
      />
    }
    startBlock={
      <HStack
        space={IODimensions.gap.module.leading}
        style={{ alignItems: "center", flexGrow: 1, flexShrink: 1 }}
      >
        <IOSkeleton
          radius={IODimensions.radius.skeleton.graphic}
          shape="square"
          size={IODimensions.size.icon.module.default}
        />
        <IOSkeleton
          height={IOTypography.bodySmall.size}
          radius={IODimensions.radius.skeleton.text}
          shape="rectangle"
          width="40%"
        />
      </HStack>
    }
  />
);

const styles = StyleSheet.create({
  image: {
    width: IODimensions.size.icon.module.default,
    height: IODimensions.size.icon.module.default,
    resizeMode: "contain"
  }
});

export { ModuleCredential };
