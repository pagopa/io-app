import {
  Divider,
  H2,
  IOMarkdownLite,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import { View } from "react-native";
import { IOScrollView, IOScrollViewActions } from "./IOScrollView";

export type IOScrollViewWithListItems = {
  title?: string;
  subtitle?: string;
  renderItems: Array<ListItemInfo>;
  listItemHeaderLabel?: string;
  actions: IOScrollViewActions;
  isHeaderVisible?: boolean;
};

const ItemsList = ({ items }: { items: Array<ListItemInfo> }) =>
  items.map((item, index) => (
    <View key={`${item.value}-${index}`}>
      <ListItemInfo
        {...item}
        accessibilityLabel={`${item.label}; ${item.value}`}
      />
      {index < items.length - 1 && <Divider />}
    </View>
  ));

export const IOScrollViewWithListItems = ({
  title,
  subtitle,
  actions,
  renderItems,
  listItemHeaderLabel
}: IOScrollViewWithListItems) => (
  <IOScrollView actions={actions}>
    <H2>{title}</H2>
    {subtitle && (
      <>
        <VSpacer size={8} />
        <IOMarkdownLite content={subtitle} />
      </>
    )}
    {listItemHeaderLabel && (
      <>
        <VSpacer size={16} />
        <ListItemHeader label={listItemHeaderLabel} />
      </>
    )}
    <ItemsList items={renderItems} />
  </IOScrollView>
);
