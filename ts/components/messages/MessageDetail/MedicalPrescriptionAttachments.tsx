import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";

import { PrescriptionData } from "../../../../definitions/backend/PrescriptionData";
import I18n from "../../../i18n";
import { Attachment } from "../../../store/reducers/entities/messages/types";
import customVariables from "../../../theme/variables";
import { getPrescriptionDataFromName } from "../../../utils/messages";
import { VSpacer } from "../../core/spacer/Spacer";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";

type Props = Readonly<{
  prescriptionData?: PrescriptionData;
  prescriptionAttachments: ReadonlyArray<Attachment>;
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
      <VSpacer size={8} />
      <NBText style={styles.label}>
        {I18n.t(`messages.medical.${item.name}`, {
          defaultValue: I18n.t("messages.medical.not_available")
        }).toUpperCase()}
      </NBText>
      {xml && <SvgXml xml={xml} width={"100%"} height={BARCODE_HEIGHT} />}
      {O.isSome(value) && (
        <NBText semibold={true} style={{ textAlign: "center" }}>
          {I18n.t("global.symbols.asterisk")}
          {value.value}
          {I18n.t("global.symbols.asterisk")}
        </NBText>
      )}
      <VSpacer size={16} />
    </View>
  );
};

const MedicalPrescriptionAttachments = ({
  prescriptionAttachments,
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
      <VSpacer size={4} />
      <ItemSeparatorComponent noPadded={true} bold={true} />
    </View>

    {prescriptionAttachments
      .filter(_ => _.mimeType === svgXml)
      .map((prescriptionAttachment, index) => (
        <View key={index}>
          <Item
            prescriptionData={prescriptionData}
            item={prescriptionAttachment}
            idx={index}
          />
          <ItemSeparatorComponent />
        </View>
      ))}

    <ItemSeparatorComponent />

    <VSpacer size={16} />
    <NBText style={[styles.note, styles.padded]}>
      {I18n.t("messages.medical.note")}
    </NBText>
  </View>
);

export default MedicalPrescriptionAttachments;
