import { Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { MessageAttachment } from "../../../definitions/backend/MessageAttachment";
import customVariables from "../../theme/variables";

type Props = Readonly<{
  attachments: ReadonlyArray<MessageAttachment>;
}>;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  image: {
    width: 300,
    height: 100,
    resizeMode: "contain"
  }
});

export default class MedicalPrescriptionAttachments extends React.PureComponent<
  Props
> {
  // We should show the SvgXml and share the png version.
  // These two image are the same. They differ only for the mime_type
  private getImage = (att: MessageAttachment) =>
    att.mime_type === "image/svg+xml" ? (
      <SvgXml
        xml={Buffer.from(att.content, "base64").toString("ascii")}
        width={"100%"}
      />
    ) : (
      <Image
        style={styles.image}
        source={{
          uri: `data:image/png;base64,${att.content}`
        }}
      />
    );

  private renderItem = ({ item }: { item: MessageAttachment }) => {
    return (
      <View style={styles.padded}>
        <Text>
          {item.name}
          {item.mime_type}
        </Text>
        {this.getImage(item)}
        <View spacer={true} />
      </View>
    );
  };

  private attachmentsToRender = this.props.attachments.filter(a =>
    a.mime_type.includes("svg")
  );

  public render() {
    return (
      <FlatList
        data={this.attachmentsToRender}
        renderItem={this.renderItem}
        keyExtractor={(_, idx: number) => `attachment-${idx}`}
      />
    );
  }
}
