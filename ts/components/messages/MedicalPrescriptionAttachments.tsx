import { Text, View } from "native-base";
import * as React from "react";
import { Image, StyleSheet } from "react-native";
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
  private getImage = (att: MessageAttachment, idx: number) =>
    att.mime_type === "image/svg+xml" ? (
      <SvgXml
        key={`svg_${idx}`}
        xml={Buffer.from(att.content, "base64").toString("ascii")}
        width={"100%"}
      />
    ) : (
      <Image
        key={`image_${idx}`}
        style={styles.image}
        source={{
          uri: `data:image/png;base64,${att.content}`
        }}
      />
    );

  public render() {
    return this.props.attachments.map((att, idx) => {
      return (
        <View key={`frag_${idx}`} style={styles.padded}>
          <Text key={`text_${idx}`}>{att.name}</Text>
          {this.getImage(att, idx)}
          <View spacer={true} />
        </View>
      );
    });
  }
}
