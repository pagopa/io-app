import { fromNullable } from "fp-ts/lib/Option";
import I18n from "i18n-js";
import { Text, View } from "native-base";
import * as React from "react";
import { StyleSheet } from "react-native";
import { PrescriptionData } from "../../../definitions/backend/PrescriptionData";
import customVariables from "../../theme/variables";
import CopyButtonComponent from "../CopyButtonComponent";

type Props = Readonly<{
  prescriptionData: PrescriptionData;
}>;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: customVariables.contentPadding,
    backgroundColor: customVariables.brandGray,
    borderBottomWidth: 1,
    borderBottomColor: customVariables.colorWhite
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

export default class MedicalPrescriptionIdentifiersComponent extends React.PureComponent<
  Props
> {
  private renderItem = (label: string, value: string) => {
    return (
      <React.Fragment>
        <Text>{label}</Text>
        <View style={styles.row}>
          <Text style={styles.value} bold={true}>
            {value}
          </Text>
          <CopyButtonComponent textToCopy={value} />
        </View>
      </React.Fragment>
    );
  };

  public render() {
    const { prescriptionData } = this.props;
    const iup = fromNullable(prescriptionData.iup).fold("n/a", s => s);
    const prescriberFiscalCode = fromNullable(
      prescriptionData.prescriber_fiscal_code
    ).fold("n/a", s => s as string);

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
