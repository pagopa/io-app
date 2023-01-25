import * as React from "react";
import { View, StyleSheet } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import ButtonDefaultOpacity from "../../../../components/ButtonDefaultOpacity";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import { H3 } from "../../../../components/core/typography/H3";
import { Label } from "../../../../components/core/typography/Label";
import { IOColors } from "../../../../components/core/variables/IOColors";
import IconFont from "../../../../components/ui/IconFont";
import InternationalCircuitIconsBar from "../../../../components/wallet/InternationalCircuitIconsBar";
import I18n from "../../../../i18n";
import { GlobalState } from "../../../../store/reducers/types";
import bancomatInformationBottomSheet from "../utils/bancomatInformationBottomSheet";

type OwnProps = {
  onAddPaymentMethod: () => void;
};

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const styles = StyleSheet.create({
  button: {
    width: "100%",
    borderColor: IOColors.blue
  },
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
        <IconFont
          name={"io-info"}
          size={24}
          color={IOColors.blue}
          onPress={present}
          testID={"noticeIconFont"}
        />
      </View>
      <VSpacer size={16} />
      <InternationalCircuitIconsBar />
      <VSpacer size={16} />
      <ButtonDefaultOpacity
        style={styles.button}
        bordered={true}
        onPress={() => {
          props.onAddPaymentMethod?.();
        }}
        onPressWithGestureHandler={true}
        testID={"addPaymentMethodButton"}
      >
        <Label>{I18n.t("wallet.bancomat.details.debit.addCta")}</Label>
      </ButtonDefaultOpacity>
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
