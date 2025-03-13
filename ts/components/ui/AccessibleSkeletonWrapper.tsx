import { View, ViewProps } from "react-native";

/**
 * You should use this wrapper component if you have a series of components
 * that are loading and you don't want to let the user select element by element
 * with the screen reader.
 *
 * For example, if you need to display a list of loading message list items,
 * you should probably use this wrapper and set the `accessibilityLabel` to
 * `Loading messages...` instead of setting the accessibilityLabel to each
 * loading message list item.
 *
 */
export const AccessibleSkeletonWrapper = ({
  accessibilityLabel,
  children
}: Pick<ViewProps, "accessibilityLabel" | "children">) => (
  <View
    accessible={true}
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ busy: true }}
  >
    {children}
  </View>
);
