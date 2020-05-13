import I18n from "i18n-js";
import { Text, View } from "native-base";
import * as React from "react";
import { FlatList, Image, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { MessageAttachment } from "../../../definitions/backend/MessageAttachment";
import { PrescriptionData } from "../../../definitions/backend/PrescriptionData";
import customVariables from "../../theme/variables";
import { getPrescriptionDataFromName } from "../../utils/messages";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

type Props = Readonly<{
  prescriptionData?: PrescriptionData;
  attachments: ReadonlyArray<MessageAttachment>;
  organizationName?: string;
  typeToRender: "svg" | "png";
}>;

const BARCODE_HEIGHT = 52;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  image: {
    width: 300,
    height: BARCODE_HEIGHT,
    resizeMode: "contain"
  },
  note: {
    fontSize: 12,
    lineHeight: 16
  },
  label: {
    fontSize: 12,
    lineHeight: 22
  },
  customHeader: {
    marginBottom: -4
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
        height={BARCODE_HEIGHT}
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
    const value = getPrescriptionDataFromName(
      this.props.prescriptionData,
      item.name
    );
    return (
      <View style={styles.padded}>
        <View spacer={true} small={true} />
        <Text style={styles.label}>
          {I18n.t(`messages.medical.${item.name}`).toUpperCase()}
        </Text>
        {this.getImage(item)}
        {value.isSome() && (
          <Text small={true} semibold={true} style={{ textAlign: "center" }}>
            {I18n.t("global.symbols.asterisk")}
            {value.value}
            {I18n.t("global.symbols.asterisk")}
          </Text>
        )}
        <View spacer={true} />
      </View>
    );
  };

  private attachmentsToRender = this.props.attachments.filter(a =>
    a.mime_type.includes(this.props.typeToRender)
  );

  private footerItem = (
    <React.Fragment>
      <ItemSeparatorComponent />
      <View spacer={true} />
      <Text style={[styles.note, styles.padded]}>
        {I18n.t("messages.medical.note")}
      </Text>
    </React.Fragment>
  );

  private headerItem = (
    <View style={styles.padded}>
      <Text bold={true} style={styles.customHeader}>
        {I18n.t("messages.medical.nationalService").toUpperCase()}
      </Text>
      {this.props.organizationName && (
        <Text style={styles.label}>
          {this.props.organizationName.toUpperCase()}
        </Text>
      )}
      <View spacer={true} xsmall={true} />
      <ItemSeparatorComponent noPadded={true} bold={true} />
    </View>
  );

  public render() {
    return (
      <FlatList
        data={this.attachmentsToRender}
        renderItem={this.renderItem}
        keyExtractor={(_, idx: number) => `attachment-${idx}`}
        ItemSeparatorComponent={ItemSeparatorComponent}
        ListHeaderComponent={this.headerItem}
        ListFooterComponent={this.footerItem}
      />
    );
  }
}
