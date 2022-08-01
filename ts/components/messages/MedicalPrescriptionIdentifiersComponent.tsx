import { fromNullable } from "fp-ts/lib/Option";
import { Text as NBText, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { PrescriptionData } from "../../../definitions/backend/PrescriptionData";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import CopyButtonComponent from "../CopyButtonComponent";
import { IOColors } from "../core/variables/IOColors";

type Props = Readonly<{
  prescriptionData: PrescriptionData;
}>;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: IOColors.greyUltraLight,
    borderBottomWidth: 1,
    borderBottomColor: IOColors.white
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center"
  },
  value: {
    color: customVariables.textMessageDetailLinkColor,
    fontSize: 18
  }
});

export default class MedicalPrescriptionIdentifiersComponent extends React.PureComponent<Props> {
  private renderItem = (label: string, value: string) => (
    <React.Fragment>
      <NBText>{label}</NBText>
      <View style={styles.row}>
        <NBText style={styles.value} bold={true}>
          {value}
        </NBText>
        <CopyButtonComponent textToCopy={value} />
      </View>
    </React.Fragment>
  );

  public render() {
    const { prescriptionData } = this.props;
    const iup = fromNullable(prescriptionData.iup).fold(
      I18n.t("messages.medical.not_available"),
      s => s
    );
    const prescriberFiscalCode = fromNullable(
      prescriptionData.prescriber_fiscal_code
    ).fold(I18n.t("messages.medical.not_available"), s => s as string);

    return (
      <View style={styles.container}>
        <View spacer={true} />
        {this.renderItem(I18n.t("messages.medical.nre"), prescriptionData.nre)}
        <View spacer={true} />
        {this.renderItem(I18n.t("messages.medical.iup"), iup)}
        <View spacer={true} />
        {this.renderItem(
          I18n.t("messages.medical.patient_fiscal_code"),
          prescriberFiscalCode
        )}
        <View spacer={true} />
      </View>
    );
  }
}
