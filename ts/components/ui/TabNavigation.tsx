import React from "react";
import { StyleSheet, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { TabItem } from "./TabItem";

type TabNavigationItem = Omit<
  TabItem,
  "onPress" | "color" | "selected" | "accessibilityLabel" | "accessibilityHint"
>;

type TabNavigation = {
  items: Array<TabNavigationItem>;
  color?: TabItem["color"];
  onItemPress?: (item: TabNavigationItem, index: number) => void;
};

const TabNavigation = ({
  items,
  color = "light",
  onItemPress
}: TabNavigation) => {
  const [selectedItem, setSelectedItem] = React.useState(0);

  const handleItemPress = (item: TabNavigationItem, index: number) => {
    setSelectedItem(index);
    onItemPress?.(item, index);
  };

  return (
    <ScrollView
      horizontal={true}
      centerContent={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item, index) => (
        <View key={index} style={{ marginLeft: index === 0 ? 0 : 16 }}>
          <TabItem
            {...item}
            accessibilityLabel={item.label}
            accessibilityHint={item.label}
            selected={selectedItem === index}
            color={color}
            onPress={() => handleItemPress(item, index)}
          />
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24
  }
});

export { TabNavigation };
export type { TabNavigationItem };
