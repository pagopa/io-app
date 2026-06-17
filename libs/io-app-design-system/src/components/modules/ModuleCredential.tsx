import { ReactNode, useMemo } from "react";
import {
  Image,
  ImageSourcePropType,
  ImageURISource,
  StyleSheet
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

type ImageProps =
  | { icon: IOIcons; image?: never }
  | { icon?: never; image: ImageURISource | ImageSourcePropType }
  | { icon?: never; image?: never };

type LoadingModuleProps = {
  isLoading: true;
  loadingAccessibilityLabel?: string;
};

type BaseModuleProps = {
  isLoading?: false;
  label: string;
  badge?: Badge;
  isFetching?: boolean;
};

type ModuleCredentialProps =
  | BaseModuleProps & ImageProps & PressableModuleBaseProps;

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
  const theme = useIOTheme();
  const { hugeFontEnabled } = useIOFontDynamicScale();

  return (
    <HStack space={8} style={{ alignItems: "center" }}>
      <HStack
        space={IOVisualCostants.iconMargin as IOSpacer}
        style={{ flexGrow: 1, flexShrink: 1, alignItems: "center" }}
      >
        {/* Graphical assets */}
        {icon && !hugeFontEnabled ? (
          <Icon
            allowFontScaling
            name={icon}
            size={IOSelectionListItemVisualParams.iconSize}
            color={theme["icon-decorative"]}
          />
        ) : (
          image && (
            <Image
              source={image}
              style={styles.image}
              accessibilityIgnoresInvertColors={true}
            />
          )
        )}

        <BodySmall
          color={theme["interactiveElem-default"]}
          weight="Semibold"
          numberOfLines={2}
          lineBreakMode="middle"
          style={{ flexShrink: 1 }}
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
  const theme = useIOTheme();

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
              <HSpacer size={8} />
              <LoadingSpinner testID={activityIndicatorTestID} />
            </>
          ) : (
            <Icon
              testID={chevronTestID}
              name="chevronRightListItem"
              color={theme["interactiveElem-default"]}
              size={IOListItemVisualParams.chevronSize}
            />
          ))}
      </HStack>
    ) : null;
  }, [testID, theme, isFetching, badge, onPress]);

  return onPress ? (
    <PressableModuleBase {...pressableProps} testID={testID} onPress={onPress}>
      <ModuleContent
        icon={icon}
        image={image}
        label={label}
        endComponent={endComponent}
      />
    </PressableModuleBase>
  ) : (
    <ModuleStatic>
      <ModuleContent
        icon={icon}
        image={image}
        label={label}
        endComponent={endComponent}
      />
    </ModuleStatic>
  );
};

const ModuleCredentialSkeleton = ({
  loadingAccessibilityLabel
}: Pick<LoadingModuleProps, "loadingAccessibilityLabel">) => (
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
        <IOSkeleton shape="rectangle" width={96} height={16} radius={8} />
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

export { ModuleCredential };
