import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { Text as NBText } from "native-base";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { PrescriptionData } from "../../../../../definitions/backend/PrescriptionData";
import I18n from "../../../../i18n";
import customVariables from "../../../../theme/variables";
import CopyButtonComponent from "../../../CopyButtonComponent";
import { VSpacer } from "../../../core/spacer/Spacer";
import { IOColors } from "../../../core/variables/IOColors";

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
    const iup = pipe(
      prescriptionData.iup,
      O.fromNullable,
      O.fold(
        () => I18n.t("messages.medical.not_available"),
        s => s
      )
    );
    const prescriberFiscalCode = pipe(
      prescriptionData.prescriber_fiscal_code,
      O.fromNullable,
      O.fold(
        () => I18n.t("messages.medical.not_available"),
        s => s as string
      )
    );

    return (
      <View style={styles.container}>
        <VSpacer size={16} />
        {this.renderItem(I18n.t("messages.medical.nre"), prescriptionData.nre)}
        <VSpacer size={16} />
        {this.renderItem(I18n.t("messages.medical.iup"), iup)}
        <VSpacer size={16} />
        {this.renderItem(
          I18n.t("messages.medical.patient_fiscal_code"),
          prescriberFiscalCode
        )}
        <VSpacer size={16} />
      </View>
    );
  }
}
