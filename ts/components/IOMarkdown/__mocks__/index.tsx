import { Text, View } from "react-native";
import { IOMarkdownProps } from "..";

const IOMarkdown = (props: IOMarkdownProps) => (
  <View>
    <Text>{props.content}</Text>
  </View>
);
export default IOMarkdown;
