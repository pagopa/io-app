import React from "react";
import { FlexStyle, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { TabItem } from "./TabItem";

export type TabNavigationItem = Omit<
  TabItem,
  "onPress" | "color" | "selected" | "accessibilityLabel" | "accessibilityHint"
>;

type TabNavigationChildren =
  | React.ReactElement<TabItem>
  | Array<React.ReactElement<TabItem>>;

type TabAlignment = "start" | "center" | "end" | "stretch";

type TabNavigation = {
  // Configuration
  color?: TabItem["color"];
  selectedIndex?: number;
  tabAlignment?: TabAlignment;
  // Events
  onItemPress?: (index: number) => void;
  // Tabs
  children: TabNavigationChildren;
};

const itemsJustify: Record<TabAlignment, FlexStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "space-between"
};

const TabNavigation = ({
  color = "light",
  selectedIndex: forceSelectedIndex,
  tabAlignment = "center",
  onItemPress,
  children
}: TabNavigation) => {
  const [itemMinWidth, setItemMinWidth] = React.useState<number>(0);
  const [selectedIndex, setSelectedIndex] = React.useState(
    forceSelectedIndex ?? 0
  );

  const handleItemPress = (index: number) => {
    setSelectedIndex(forceSelectedIndex ?? index);
    onItemPress?.(index);
  };

  const handleItemOnLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setItemMinWidth(current => Math.max(current, width));
  };

  const stretchItems = tabAlignment === "stretch";

  const wrapChild = (child: React.ReactElement<TabItem>, index: number = 0) => (
    <View
      key={index}
      style={[
        styles.item,
        {
          marginEnd: index === React.Children.count(children) - 1 ? 0 : 8
        },
        stretchItems && {
          minWidth: itemMinWidth
        }
      ]}
      onLayout={handleItemOnLayout}
    >
      {React.cloneElement<TabItem>(child, {
        onPress: event => {
          child.props.onPress?.(event);
          handleItemPress(index);
        },
        selected: selectedIndex === index,
        color
      })}
    </View>
  );

  return (
    <ScrollView
      horizontal={true}
      centerContent={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        {
          justifyContent: itemsJustify[tabAlignment]
        }
      ]}
    >
      {Array.isArray(children) ? children.map(wrapChild) : wrapChild(children)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24
  },
  item: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 100,
    alignItems: "center"
  }
});

export { TabNavigation };
