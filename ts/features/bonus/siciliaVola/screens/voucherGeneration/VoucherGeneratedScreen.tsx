import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import { SafeAreaView, ScrollView } from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { BlockButtonProps } from "../../../../../components/ui/BlockButtons";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { showToast } from "../../../../../utils/showToast";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import { fold, isLoading, isReady } from "../../../bpd/model/RemoteValue";
import VoucherInformationComponent from "../../components/VoucherInformationComponent";
import {
  svGenerateVoucherBack,
  svGenerateVoucherCompleted,
  svGenerateVoucherFailure,
  svGenerateVoucherGeneratedVoucher,
  svGetPdfVoucher
} from "../../store/actions/voucherGeneration";
import { selectedPdfVoucherStateSelector } from "../../store/reducers/selectedVoucher";
import { voucherGeneratedSelector } from "../../store/reducers/voucherGeneration/voucherGenerated";
import { voucherRequestSelector } from "../../store/reducers/voucherGeneration/voucherRequest";
import { SvVoucherId } from "../../types/SvVoucher";
import { VoucherRequest } from "../../types/SvVoucherRequest";
import { isVoucherRequest } from "../../utils";
import SvGeneratedVoucherTimeoutScreen from "./ko/SvGeneratedVoucherTimeoutScreen";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const VoucherGeneratedScreen = (props: Props): React.ReactElement | null => {
  const {
    remoteVoucherGenerated,
    maybeVoucherRequest,
    generateVoucherRequest,
    pdfVoucherState
  } = props;

  useEffect(() => {
    pipe(
      maybeVoucherRequest,
      O.map(vR => {
        if (isVoucherRequest(vR)) {
          generateVoucherRequest(vR);
        }
      })
    );
  }, [maybeVoucherRequest, generateVoucherRequest]);

  useEffect(() => {
    fold(
      pdfVoucherState,
      () => null,
      () => null,
      _ => showToast(I18n.t("bonus.sv.pdfVoucher.toast.ok"), "success"),
      _ => showToast(I18n.t("bonus.sv.pdfVoucher.toast.ko"))
    );
  }, [pdfVoucherState]);

  if (O.isNone(maybeVoucherRequest)) {
    props.failure("Voucher request is None");
    return null;
  }
  const voucherRequest = maybeVoucherRequest.value;
  if (!isVoucherRequest(voucherRequest)) {
    props.failure("Partial voucher request is not a complete voucher request");
    return null;
  }

  if (!isReady(remoteVoucherGenerated)) {
    return (
      <BaseScreenComponent
        goBack={false}
        contextualHelp={emptyContextualHelp}
        headerTitle={I18n.t("bonus.sv.headerTitle")}
      >
        <LoadingErrorComponent
          isLoading={isLoading(remoteVoucherGenerated)}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={() => props.generateVoucherRequest(voucherRequest)}
        />
      </BaseScreenComponent>
    );
  }

  const voucherGenerated = remoteVoucherGenerated.value;

  switch (voucherGenerated.kind) {
    // TODO: manage conflict and other state when the final swagger is available
    case "success":
      const backButtonProps: BlockButtonProps = {
        primary: false,
        bordered: true,
        onPress: props.completed,
        title: I18n.t("global.buttons.exit")
      };

      const continueButtonProps: BlockButtonProps = {
        primary: true,
        onPress: () => props.stampaVoucher(voucherGenerated.value.id),
        title: I18n.t("global.genericSave"),
        disabled: isLoading(pdfVoucherState)
      };
      return (
        <BaseScreenComponent
          goBack={false}
          contextualHelp={emptyContextualHelp}
          headerTitle={I18n.t("bonus.sv.headerTitle")}
        >
          <SafeAreaView style={IOStyles.flex} testID={"VoucherGeneratedScreen"}>
            <ScrollView style={IOStyles.horizontalContentPadding}>
              <H1>
                {I18n.t("bonus.sv.voucherGeneration.voucherGenerated.title")}
              </H1>
              <VSpacer size={16} />
              <H5 weight={"Regular"}>
                {I18n.t("bonus.sv.voucherGeneration.voucherGenerated.subtitle")}
              </H5>
              <VSpacer size={16} />
              <VoucherInformationComponent
                voucherCode={voucherGenerated.value.id.toString()}
                qrCode={voucherGenerated.value.qrCode}
                barCode={voucherGenerated.value.barCode}
              />
              <VSpacer size={24} />
            </ScrollView>
            <FooterWithButtons
              type={"TwoButtonsInlineHalf"}
              leftButton={backButtonProps}
              rightButton={continueButtonProps}
            />
          </SafeAreaView>
        </BaseScreenComponent>
      );
    case "timeout":
      return <SvGeneratedVoucherTimeoutScreen />;
  }
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(svGenerateVoucherBack()),
  completed: () => dispatch(svGenerateVoucherCompleted()),
  failure: (reason: string) => dispatch(svGenerateVoucherFailure(reason)),
  generateVoucherRequest: (voucherRequest: VoucherRequest) =>
    dispatch(svGenerateVoucherGeneratedVoucher.request(voucherRequest)),
  stampaVoucher: (voucherId: SvVoucherId) =>
    dispatch(svGetPdfVoucher.request(voucherId))
});
const mapStateToProps = (state: GlobalState) => ({
  maybeVoucherRequest: voucherRequestSelector(state),
  remoteVoucherGenerated: voucherGeneratedSelector(state),
  pdfVoucherState: selectedPdfVoucherStateSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VoucherGeneratedScreen);
