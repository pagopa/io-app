import { View } from "react-native";
import { ShowMoreListItemProps } from "../ShowMoreListItem";

export const ShowMoreListItem = ({ sections }: ShowMoreListItemProps) => (
  <>
    <View>Mock ShowMoreListItem</View>
    {sections.map((section, index) => (
      <View key={index}>
        <View>{`View at ${index}`}</View>
        <View>{section.title}</View>
        {section.items.map((item, itemIndex) => (
          <View key={itemIndex}>
            <View>{`item at ${itemIndex}`}</View>
            <View>{item.accessibilityLabel}</View>
            {item.icon && <View>{item.icon}</View>}
            <View>{item.label}</View>
            <View>{item.value}</View>
            {item.valueToCopy && <View>{item.valueToCopy}</View>}
          </View>
        ))}
      </View>
    ))}
  </>
);
