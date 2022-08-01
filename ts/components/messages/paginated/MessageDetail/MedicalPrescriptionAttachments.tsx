import { Text as NBText, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";

import { PrescriptionData } from "../../../../../definitions/backend/PrescriptionData";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import { getPrescriptionDataFromName } from "../../../../utils/messages";
import { Attachment } from "../../../../store/reducers/entities/messages/types";
import ItemSeparatorComponent from "../../../ItemSeparatorComponent";

type Props = Readonly<{
  prescriptionData?: PrescriptionData;
  attachments: ReadonlyArray<Attachment>;
  organizationName?: string;
}>;

const BARCODE_HEIGHT = 52;

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: customVariables.contentPadding
  },
  note: {
    lineHeight: 16,
    paddingTop: 4
  },
  label: {
    lineHeight: 22
  },
  customHeader: {
    marginBottom: -4
  }
});

export const svgXml = "image/svg+xml";

const Item = ({
  prescriptionData,
  item,
  idx
}: {
  prescriptionData?: PrescriptionData;
  item: Attachment;
  idx: number;
}) => {
  const value = getPrescriptionDataFromName(prescriptionData, item.name);
  const xml = Buffer.from(item.content, "base64").toString("ascii");
  return (
    <View style={styles.padded} key={`attachment-${idx}`}>
      <View spacer={true} small={true} />
      <NBText style={styles.label}>
        {I18n.t(`messages.medical.${item.name}`, {
          defaultValue: I18n.t("messages.medical.not_available")
        }).toUpperCase()}
      </NBText>
      {xml && <SvgXml xml={xml} width={"100%"} height={BARCODE_HEIGHT} />}
      {value.isSome() && (
        <NBText semibold={true} style={{ textAlign: "center" }}>
          {I18n.t("global.symbols.asterisk")}
          {value.value}
          {I18n.t("global.symbols.asterisk")}
        </NBText>
      )}
      <View spacer={true} />
    </View>
  );
};

const MedicalPrescriptionAttachments = ({
  attachments,
  organizationName,
  prescriptionData
}: Props) => (
  <View>
    <View style={styles.padded}>
      <NBText bold={true} style={styles.customHeader}>
        {I18n.t("messages.medical.nationalService").toUpperCase()}
      </NBText>
      {organizationName && (
        <NBText style={styles.label}>{organizationName.toUpperCase()}</NBText>
      )}
      <View spacer={true} xsmall={true} />
      <ItemSeparatorComponent noPadded={true} bold={true} />
    </View>

    {attachments
      .filter(_ => _.mimeType === svgXml)
      .map((attachment, index) => (
        <View key={index}>
          <Item
            prescriptionData={prescriptionData}
            item={attachment}
            idx={index}
          />
          <ItemSeparatorComponent />
        </View>
      ))}

    <ItemSeparatorComponent />

    <View spacer={true} />
    <NBText style={[styles.note, styles.padded]}>
      {I18n.t("messages.medical.note")}
    </NBText>
  </View>
);

export default MedicalPrescriptionAttachments;
