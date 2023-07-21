import React from "react";
import { FlexStyle, StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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

  const renderChildren = () => {
    if (Array.isArray(children)) {
      return children.map((item, index) => (
        <View key={index} style={{ marginLeft: index === 0 ? 0 : 16 }}>
          {React.cloneElement<TabItem>(item, {
            key: index,
            onPress: event => {
              item.props.onPress?.(event);
              handleItemPress(index);
            },
            selected: selectedIndex === index,
            color,
            accessibilityLabel: item.props.label,
            accessibilityHint: item.props.label
          })}
        </View>
      ));
    }

    return React.cloneElement<TabItem>(children, {
      onPress: () => handleItemPress(0),
      selected: true,
      color,
      accessibilityLabel: children.props.label,
      accessibilityHint: children.props.label
    });
  };

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
      {renderChildren()}
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
