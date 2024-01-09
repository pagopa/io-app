import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { View, StyleSheet } from "react-native";
import { IOColors, VSpacer } from "@pagopa/io-app-design-system";
import { PrescriptionData } from "../../../../../definitions/backend/PrescriptionData";
import I18n from "../../../../i18n";
import CopyButtonComponent from "../../../../components/CopyButtonComponent";
import { Body } from "../../../../components/core/typography/Body";
import { H3 } from "../../../../components/core/typography/H3";
import { IOStyles } from "../../../../components/core/variables/IOStyles";

type Props = Readonly<{
  prescriptionData: PrescriptionData;
}>;

const styles = StyleSheet.create({
  container: {
    backgroundColor: IOColors.greyUltraLight,
    borderBottomWidth: 1,
    borderBottomColor: IOColors.white
  },
  centerContent: {
    alignContent: "center"
  }
});

export default class MedicalPrescriptionIdentifiersComponent extends React.PureComponent<Props> {
  private renderItem = (label: string, value: string) => (
    <React.Fragment>
      <Body>{label}</Body>
      <View style={[IOStyles.rowSpaceBetween, styles.centerContent]}>
        <H3 weight="Bold" color="blue">
          {value}
        </H3>
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
      <View style={[IOStyles.horizontalContentPadding, styles.container]}>
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
