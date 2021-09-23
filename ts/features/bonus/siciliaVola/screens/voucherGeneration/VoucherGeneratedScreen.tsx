import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView } from "react-native";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCompleted,
  svGenerateVoucherGeneratedVoucher
} from "../../store/actions/voucherGeneration";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import { VoucherRequest } from "../../types/SvVoucherRequest";
import I18n from "../../../../../i18n";
import { View } from "native-base";
import { H5 } from "../../../../../components/core/typography/H5";
import VoucherInformationComponent from "../../components/VoucherInformationComponent";
import { useEffect } from "react";
import { voucherRequestSelector } from "../../store/reducers/voucherRequest";
import { isVoucherRequest } from "../../utils";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const VoucherGeneratedScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    props.voucherRequest.map(vR => {
      if (isVoucherRequest(vR)) {
        props.generateVoucherRequest(vR);
      }
    });
  }, []);

  const backButtonProps = {
    primary: false,
    bordered: true,
    onPress: props.completed,
    title: I18n.t("global.buttons.exit")
  };

  // TODO: substitute the onPress function with the voucher pdf request
  const continueButtonProps = {
    primary: true,
    onPress: () => true,
    title: I18n.t("global.genericSave")
  };

  // TODO: manage loading/error/timeout(SvGeneratedVoucherTimeoutScreen) state on generateVoucherRequest selector
  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"VoucherGeneratedScreen"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("bonus.sv.voucherGeneration.voucherGenerated.title")}</H1>
          <View spacer />
          <H5 weight={"Regular"}>
            {I18n.t("bonus.sv.voucherGeneration.voucherGenerated.subtitle")}
          </H5>
          <View spacer />
          <VoucherInformationComponent
            voucherCode={"123456"}
            qrCode={"abc"}
            barCode={"abc"}
          />
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={backButtonProps}
          rightButton={continueButtonProps}
        />
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(svGenerateVoucherBack()),
  completed: () => dispatch(svGenerateVoucherCompleted()),
  generateVoucherRequest: (voucherRequest: VoucherRequest) =>
    dispatch(svGenerateVoucherGeneratedVoucher.request(voucherRequest))
});
const mapStateToProps = (state: GlobalState) => ({
  voucherRequest: voucherRequestSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VoucherGeneratedScreen);
