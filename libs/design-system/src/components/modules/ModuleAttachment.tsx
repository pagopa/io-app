import { useCallback } from "react";
import { GestureResponderEvent, PressableProps } from "react-native";

import { useIOTheme } from "../../context";
import { IOListItemVisualParams } from "../../core";
import { WithTestID } from "../../utils/types";
import { Badge } from "../badge";
import { Icon } from "../icons";
import { HStack, VStack } from "../layout";
import { LoadingSpinner } from "../loadingSpinner";
import { IOSkeleton } from "../skeleton";
import { Body } from "../typography";
import { ModuleStatic } from "./ModuleStatic";
import { PressableModuleBase } from "./PressableModuleBase";

export type ModuleAttachmentProps = PartialProps &
  Pick<
    PressableProps,
    "accessibilityLabel" | "disabled" | "onPress" | "testID"
  >;

type PartialProps = WithTestID<{
  fetchingAccessibilityLabel?: string;
  format: "doc" | "pdf";
  isFetching?: boolean;
  isLoading?: boolean;
  loadingAccessibilityLabel?: string;
  onPress: (event: GestureResponderEvent) => void;
  title: string;
}>;

const ModuleAttachmentContent = ({
  isFetching,
  format,
  title,
  testID
}: Pick<
  ModuleAttachmentProps,
  "format" | "isFetching" | "testID" | "title"
>) => {
  const theme = useIOTheme();

  return (
    <HStack space={8} style={{ alignItems: "center" }}>
      <VStack
        space={4}
        style={{ alignItems: "flex-start", flexShrink: 1, flexGrow: 1 }}
      >
        <Body
          color={theme["interactiveElem-default"]}
          numberOfLines={2}
          weight="Semibold"
        >
          {title}
        </Body>
        <Badge text={format.toUpperCase()} variant="default" />
      </VStack>
      {isFetching ? (
        <LoadingSpinner
          testID={testID ? `${testID}_activityIndicator` : undefined}
        />
      ) : (
        <Icon
          color={theme["interactiveElem-default"]}
          name="chevronRightListItem"
          size={IOListItemVisualParams.chevronSize}
        />
      )}
    </HStack>
  );
};

/**
 * The `ModuleAttachment` component is a custom button component with an extended outline style.
 * It provides an animated scaling effect when pressed.
 *
 * @param {string}   accessibilityLabel - Optional accessibility label.
 * @param {boolean}  disabled - If true, the button is disabled.
 * @param {string}   fetchingAccessibilityLabel - Optional accessibility label to use during fetching.
 * @param {string}   loadingAccessibilityLabel - Optional accessibility label to use during loading.
 * @param {string}   format - Badge content. PDF or DOC.
 * @param {boolean}  isLoading - If true, displays a skeleton loading component.
 * @param {boolean}  isFetching - If true, displays an activity indicator.
 * @param {function} onPress - The function to be executed when the item is pressed.
 * @param {string}   testID - The test ID for testing purposes.
 * @param {string}   title - The title text to display.
 *
 */
export const ModuleAttachment = ({
  accessibilityLabel,
  disabled = false,
  fetchingAccessibilityLabel,
  loadingAccessibilityLabel,
  format,
  isLoading = false,
  isFetching = false,
  onPress,
  testID,
  title
}: ModuleAttachmentProps) => {
  const handleOnPress = useCallback(
    (event: GestureResponderEvent) => {
      if (isFetching) {
        return;
      }
      onPress(event);
    },
    [isFetching, onPress]
  );

  if (isLoading) {
    return (
      <ModuleAttachmentSkeleton
        loadingAccessibilityLabel={loadingAccessibilityLabel}
      />
    );
  }

  const pressableAccessibilityLabel =
    (isFetching && !!fetchingAccessibilityLabel
      ? fetchingAccessibilityLabel
      : accessibilityLabel) ?? title;

  return disabled || isFetching ? (
    <ModuleStatic disabled={disabled}>
      <ModuleAttachmentContent
        format={format}
        isFetching={isFetching}
        title={title}
      />
    </ModuleStatic>
  ) : (
    <PressableModuleBase
      accessibilityHint={format}
      accessibilityLabel={pressableAccessibilityLabel}
      onPress={handleOnPress}
      testID={testID}
    >
      <ModuleAttachmentContent
        format={format}
        isFetching={isFetching}
        title={title}
      />
    </PressableModuleBase>
  );
};

const ModuleAttachmentSkeleton = ({
  loadingAccessibilityLabel
}: Pick<ModuleAttachmentProps, "loadingAccessibilityLabel">) => (
  <ModuleStatic
    accessibilityLabel={loadingAccessibilityLabel}
    accessibilityState={{ busy: true }}
    accessible={true}
    startBlock={
      <VStack space={4}>
        <IOSkeleton height={16} radius={8} shape="rectangle" width={114} />
        <IOSkeleton height={20} radius={16} shape="rectangle" width={42} />
      </VStack>
    }
  />
);
