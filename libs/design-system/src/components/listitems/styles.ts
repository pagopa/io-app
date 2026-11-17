import { StyleSheet } from "react-native";

import { IODimensions } from "../../core/tokens";

const { padding } = IODimensions;

export const IOListItemStyles = StyleSheet.create({
  listItem: {
    paddingVertical: padding.listItem.default.vertical,
    paddingHorizontal: padding.listItem.default.horizontal,
    marginHorizontal: -padding.listItem.default.horizontal
  },
  listItemInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});

export const IOSelectionListItemStyles = StyleSheet.create({
  listItem: {
    paddingVertical: padding.listItem.default.vertical,
    paddingHorizontal: padding.listItem.default.horizontal,
    marginHorizontal: -padding.listItem.default.horizontal
  },
  listItemInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between"
  }
});
