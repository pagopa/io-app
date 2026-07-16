import { cloneElement, ReactElement, useState } from "react";
import { FlexStyle, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import { IOVisualCostants } from "../../core";
import { TabItem } from "./TabItem";

type TabAlignment = "center" | "end" | "start" | "stretch";

type TabNavigation = {
  // Tabs
  children: TabNavigationChildren;
  // Configuration
  color?: TabItem["color"];
  includeContentMargins?: boolean;
  // Events
  onItemPress?: (index: number) => void;
  selectedIndex?: number;
  tabAlignment?: TabAlignment;
};

type TabNavigationChildren =
  | Array<ReactElement<TabItem>>
  | ReactElement<TabItem>;

const itemsJustify: Record<TabAlignment, FlexStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "space-between"
};

const TabNavigation = ({
  color = "light",
  selectedIndex,
  tabAlignment = "center",
  onItemPress,
  children,
  includeContentMargins = true
}: TabNavigation) => {
  const [itemMinWidth, setItemMinWidth] = useState<number>(0);

  const handleItemOnLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setItemMinWidth(current => Math.max(current, width));
  };

  const stretchItems = tabAlignment === "stretch";

  const wrapChild = (child: ReactElement<TabItem>, index = 0) => (
    <View
      key={child.props.label}
      onLayout={handleItemOnLayout}
      style={[
        styles.item,
        stretchItems && {
          minWidth: itemMinWidth
        }
      ]}
    >
      {cloneElement<TabItem>(child, {
        onPress: event => {
          child.props.onPress?.(event);
          onItemPress?.(index);
        },
        selected: selectedIndex === index,
        color
      })}
    </View>
  );

  return (
    <ScrollView
      centerContent={true}
      contentContainerStyle={[
        includeContentMargins
          ? { paddingHorizontal: IOVisualCostants.appMarginDefault }
          : {},
        {
          flexGrow: 1,
          justifyContent: itemsJustify[tabAlignment],
          gap: 8
        }
      ]}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
    >
      {Array.isArray(children) ? children.map(wrapChild) : wrapChild(children)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  item: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 100,
    alignItems: "center"
  }
});

export { TabNavigation };
