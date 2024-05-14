import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { ButtonOutline, Icon, VSpacer } from "@pagopa/io-app-design-system";
import { H3 } from "../../../../components/core/typography/H3";
import InternationalCircuitIconsBar from "../../../../components/wallet/InternationalCircuitIconsBar";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import bancomatInformationBottomSheet from "../utils/bancomatInformationBottomSheet";
import TouchableDefaultOpacity from "../../../../components/TouchableDefaultOpacity";

type OwnProps = {
  onAddPaymentMethod: () => void;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

/**
 * Display the logo bar and a cta to start the onboarding of a new
 * payment method.
 * @constructor
 */

const BancomatInformation: React.FunctionComponent<Props> = props => {
  const { present, bottomSheet } = bancomatInformationBottomSheet(
    props.onAddPaymentMethod
  );
  return (
    <View testID={"bancomatInformation"}>
      <View style={styles.titleContainer}>
        <H3>{I18n.t("wallet.bancomat.details.debit.title")}</H3>
        <TouchableDefaultOpacity onPress={present} testID={"noticeIcon"}>
          <Icon name="info" size={24} color="blue" />
        </TouchableDefaultOpacity>
      </View>
      <VSpacer size={16} />
      <InternationalCircuitIconsBar />
      <VSpacer size={16} />
      <ButtonOutline
        fullWidth
        onPress={() => {
          props.onAddPaymentMethod?.();
        }}
        testID={"addPaymentMethodButton"}
        label={I18n.t("wallet.bancomat.details.debit.addCta")}
      />
      {bottomSheet}
    </View>
  );
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (_: GlobalState) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BancomatInformation);
