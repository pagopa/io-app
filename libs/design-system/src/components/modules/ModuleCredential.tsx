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
            color={theme["icon-decorative"]}
            name={icon}
            size={IOSelectionListItemVisualParams.iconSize}
          />
        ) : (
          image && (
            <Image
              accessibilityIgnoresInvertColors={true}
              source={image}
              style={styles.image}
            />
          )
        )}

        <BodySmall
          color={theme["interactiveElem-default"]}
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
              color={theme["interactiveElem-default"]}
              name="chevronRightListItem"
              size={IOListItemVisualParams.chevronSize}
              testID={chevronTestID}
            />
          ))}
      </HStack>
    ) : null;
  }, [testID, theme, isFetching, badge, onPress]);

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
      <IOSkeleton height={24} radius={16} shape="rectangle" width={64} />
    }
    startBlock={
      <HStack
        space={IOVisualCostants.iconMargin as IOSpacer}
        style={{ alignItems: "center" }}
      >
        <IOSkeleton radius={8} shape="square" size={24} />
        <IOSkeleton height={16} radius={8} shape="rectangle" width={96} />
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

export { ModuleCredential };
