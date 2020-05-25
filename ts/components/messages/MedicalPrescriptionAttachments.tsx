import { fromNullable } from "fp-ts/lib/Option";
import { Text, View } from "native-base";
import * as React from "react";
import { FlatList, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";
import { MessageAttachment } from "../../../definitions/backend/MessageAttachment";
import { PrescriptionData } from "../../../definitions/backend/PrescriptionData";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { getPrescriptionDataFromName } from "../../utils/messages";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

// the key is the attachment name, the value the decoded content
type BarCodeContents = {
  [key: string]: string;
};
type State = {
  barCodeContents: BarCodeContents;
};

type Props = Readonly<{
  prescriptionData?: PrescriptionData;
  attachments: ReadonlyArray<MessageAttachment>;
  organizationName?: string;
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

const svgXml = "image/svg+xml";

export default class MedicalPrescriptionAttachments extends React.PureComponent<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);
    this.state = { barCodeContents: {} };
  }

  public async componentDidMount() {
    // async attachment decoding from base64 to ascii
    // ascii is needed to have the plain xml to render inside SvgXml
    const barCodeContents = await new Promise<BarCodeContents>((res, _) => {
      const attchs = this.attachmentsToRender;
      const content = attchs.reduce<BarCodeContents>(
        (acc: BarCodeContents, curr: MessageAttachment) => {
          return {
            ...acc,
            [curr.name]: Buffer.from(curr.content, "base64").toString("ascii")
          };
        },
        {}
      );
      res(content);
    });
    this.setState({ barCodeContents });
  }

  // We should show the SvgXml and share the png version.
  // These two image are the same. They differ only for the mime_type
  private getImage = (att: MessageAttachment) =>
    fromNullable(this.state.barCodeContents[att.name]).fold(
      undefined,
      content => <SvgXml xml={content} width={"100%"} height={BARCODE_HEIGHT} />
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
          {I18n.t(`messages.medical.${item.name}`, {
            defaultValue: I18n.t("messages.medical.not_available")
          }).toUpperCase()}
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

  get attachmentsToRender(): ReadonlyArray<MessageAttachment> {
    return this.props.attachments.filter(a => a.mime_type === svgXml);
  }

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
