import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { SvgXml } from "react-native-svg";

import { PrescriptionData } from "../../../../definitions/backend/PrescriptionData";
import I18n from "../../../i18n";
import { Attachment } from "../../../store/reducers/entities/messages/types";
import { getPrescriptionDataFromName } from "../../../utils/messages";
import { VSpacer } from "../../core/spacer/Spacer";
import { Body } from "../../core/typography/Body";
import { IOStyles } from "../../core/variables/IOStyles";
import ItemSeparatorComponent from "../../ItemSeparatorComponent";

type Props = Readonly<{
  prescriptionData?: PrescriptionData;
  prescriptionAttachments: ReadonlyArray<Attachment>;
  organizationName?: string;
}>;

const BARCODE_HEIGHT = 52;

const styles = StyleSheet.create({
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
    <View style={IOStyles.horizontalContentPadding} key={`attachment-${idx}`}>
      <VSpacer size={8} />
      <Body>
        {I18n.t(`messages.medical.${item.name}`, {
          defaultValue: I18n.t("messages.medical.not_available")
        }).toUpperCase()}
      </Body>
      {xml && <SvgXml xml={xml} width={"100%"} height={BARCODE_HEIGHT} />}
      {O.isSome(value) && (
        <View style={IOStyles.alignCenter}>
          <Body weight="SemiBold">
            {I18n.t("global.symbols.asterisk")}
            {value.value}
            {I18n.t("global.symbols.asterisk")}
          </Body>
        </View>
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
    <View style={IOStyles.horizontalContentPadding}>
      <View style={styles.customHeader}>
        <Body weight="SemiBold">
          {I18n.t("messages.medical.nationalService").toUpperCase()}
        </Body>
      </View>
      {organizationName && <Body>{organizationName.toUpperCase()}</Body>}
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
    <View style={IOStyles.horizontalContentPadding}>
      <VSpacer size={4} />
      <Body>{I18n.t("messages.medical.note")}</Body>
    </View>
  </View>
);

export default MedicalPrescriptionAttachments;
