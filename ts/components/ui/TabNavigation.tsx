import React from "react";
import { FlexStyle, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { flap } from "fp-ts/lib/Functor";
import { TabItem } from "./TabItem";

export type TabNavigationItem = Omit<
  TabItem,
  "onPress" | "color" | "selected" | "accessibilityLabel" | "accessibilityHint"
>;

type TabNavigationChildren =
  | React.ReactElement<TabItem>
  | Array<React.ReactElement<TabItem>>;

type TabNavigation = {
  // Configuration
  color?: TabItem["color"];
  selectedIndex?: number;
  tabJustify?: FlexStyle["justifyContent"];
  // Events
  onItemPress?: (index: number) => void;
  // Tabs
  children: TabNavigationChildren;
};

const TabNavigation = ({
  color = "light",
  selectedIndex: forceSelectedIndex,
  tabJustify = "center",
  onItemPress,
  children
}: TabNavigation) => {
  const [selectedIndex, setSelectedIndex] = React.useState(
    forceSelectedIndex ?? 0
  );

  const handleItemPress = (index: number) => {
    setSelectedIndex(forceSelectedIndex ?? index);
    onItemPress?.(index);
  };

  const wrapChild = (child: React.ReactElement<TabItem>, index: number = 0) => (
    <View key={index} style={{ marginLeft: index === 0 ? 0 : 16 }}>
      {React.cloneElement<TabItem>(child, {
        onPress: event => {
          child.props.onPress?.(event);
          handleItemPress(index);
        },
        selected: selectedIndex === index,
        fullWidth: true,
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
          justifyContent: tabJustify
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24
  }
});

export { TabNavigation };
