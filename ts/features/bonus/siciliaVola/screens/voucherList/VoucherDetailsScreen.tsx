import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useEffect } from "react";
import {
  View,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { HSpacer, VSpacer } from "../../../../../components/core/spacer/Spacer";
import { H1 } from "../../../../../components/core/typography/H1";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import { navigateBack } from "../../../../../store/actions/navigation";
import { GlobalState } from "../../../../../store/reducers/types";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { useLegacyIOBottomSheetModal } from "../../../../../utils/hooks/bottomSheet";
import { showToast } from "../../../../../utils/showToast";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import {
  fold,
  isError,
  isLoading,
  isReady
} from "../../../bpd/model/RemoteValue";
import VoucherDetailBottomSheet from "../../components/VoucherDetailBottomsheet";
import { svGetPdfVoucher } from "../../store/actions/voucherGeneration";
import {
  svVoucherDetailGet,
  svVoucherRevocation
} from "../../store/actions/voucherList";
import {
  selectedPdfVoucherStateSelector,
  selectedVoucherCodeSelector,
  selectedVoucherRevocationStateSelector,
  selectedVoucherSelector
} from "../../store/reducers/selectedVoucher";
import { SvVoucherId } from "../../types/SvVoucher";
import { fromVoucherToDestinationLabels } from "../../utils";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  itemRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

const handleVoucherRevocation = (onVoucherRevocation: () => void) => {
  Alert.alert(
    I18n.t("bonus.sv.voucherList.details.voucherRevocation.alert.title"),
    I18n.t("bonus.sv.voucherList.details.voucherRevocation.alert.message"),
    [
      {
        text: I18n.t(
          "bonus.sv.voucherList.details.voucherRevocation.alert.cta.ok"
        ),
        style: "default",
        onPress: onVoucherRevocation
      },
      {
        text: I18n.t(
          "bonus.sv.voucherList.details.voucherRevocation.alert.cta.ko"
        ),
        style: "default"
      }
    ]
  );
};

const VoucherDetailsScreen = (props: Props): React.ReactElement | null => {
  const {
    selectedVoucherCode,
    getVoucherDetail,
    revocationState,
    back,
    pdfVoucherState
  } = props;

  useEffect(() => {
    if (selectedVoucherCode !== undefined) {
      getVoucherDetail(selectedVoucherCode);
    }
  }, [selectedVoucherCode, getVoucherDetail]);

  useEffect(() => {
    if (isError(revocationState)) {
      showToast(
        I18n.t("bonus.sv.voucherList.details.voucherRevocation.toast.ko")
      );
    }
    // Return to the VoucherListScreen if the revocation is completed since the voucher doesn't exist anymore.
    if (isReady(revocationState)) {
      showToast(
        I18n.t("bonus.sv.voucherList.details.voucherRevocation.toast.ok"),
        "success"
      );
      back();
    }
  }, [revocationState, back]);

  useEffect(() => {
    fold(
      pdfVoucherState,
      () => null,
      () => null,
      _ => showToast(I18n.t("bonus.sv.pdfVoucher.toast.ok"), "success"),
      _ => showToast(I18n.t("bonus.sv.pdfVoucher.toast.ko"))
    );
  }, [pdfVoucherState]);

  const { present, bottomSheet, dismiss } = useLegacyIOBottomSheetModal(
    isReady(props.selectedVoucher) ? (
      <VoucherDetailBottomSheet
        barCode={props.selectedVoucher.value.barCode}
        qrCode={props.selectedVoucher.value.qrCode}
        pdfVoucherState={pdfVoucherState}
      />
    ) : null,
    I18n.t("bonus.sv.components.voucherBottomsheet.title"),
    650,
    <FooterWithButtons
      type={"TwoButtonsInlineHalf"}
      leftButton={{
        bordered: true,
        onPress: () => dismiss(),
        title: I18n.t("bonus.sv.components.voucherBottomsheet.cta.exit"),
        onPressWithGestureHandler: true
      }}
      rightButton={{
        primary: true,
        onPress: () => {
          dismiss();
          props.stampaVoucher(selectedVoucher.id);
        },
        title: I18n.t("global.genericSave"),
        onPressWithGestureHandler: true,
        disabled: isLoading(props.pdfVoucherState)
      }}
    />
  );

  // The selectedVoucherCode can't be undefined in this screen
  if (!isReady(props.selectedVoucher)) {
    return pipe(
      selectedVoucherCode,
      O.fromNullable,
      O.fold(
        () => null,
        svc => (
          <BaseScreenComponent
            goBack={true}
            contextualHelp={emptyContextualHelp}
            headerTitle={I18n.t("bonus.sv.headerTitle")}
          >
            <LoadingErrorComponent
              isLoading={isLoading(props.selectedVoucher)}
              loadingCaption={I18n.t("global.remoteStates.loading")}
              onRetry={() => getVoucherDetail(svc)}
            />
          </BaseScreenComponent>
        )
      )
    );
  }

  const selectedVoucher = props.selectedVoucher.value;

  const voucherRevocationButtonProps = {
    bordered: true,
    style: {
      borderColor: IOColors.red
    },
    labelColor: IOColors.red,
    onPress: () =>
      handleVoucherRevocation(() =>
        props.voucherRevocationRequest(selectedVoucher.id)
      ),
    title: I18n.t("bonus.sv.voucherList.details.cta.voucherRevocation")
  };

  const voucherId = selectedVoucher.id?.toString() ?? "";

  // The check isReady(revocationState) is needed in order to avoid glitch while change screen
  if (isLoading(revocationState) || isReady(revocationState)) {
    return (
      <BaseScreenComponent
        goBack={true}
        contextualHelp={emptyContextualHelp}
        headerTitle={I18n.t("bonus.sv.headerTitle")}
      >
        <LoadingErrorComponent
          isLoading={true}
          loadingCaption={I18n.t("global.remoteStates.loading")}
          onRetry={() => null}
        />
      </BaseScreenComponent>
    );
  }

  const openQrButtonProps = {
    primary: true,
    bordered: false,
    onPress: present,
    title: I18n.t("bonus.sv.voucherList.details.cta.openQr")
  };

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"VoucherGeneratedScreen"}>
        <ScrollView style={IOStyles.horizontalContentPadding}>
          <H1>{I18n.t("bonus.sv.voucherList.details.title")}</H1>
          <VSpacer size={24} />
          <View style={styles.itemRow}>
            <H4>{I18n.t("bonus.sv.voucherList.details.fields.uniqueCode")}</H4>

            <View
              style={{
                flexDirection: "row"
              }}
            >
              <H3 color={"bluegreyDark"}>{voucherId}</H3>
              <HSpacer size={16} />
              <CopyButtonComponent textToCopy={voucherId} />
            </View>
          </View>
          <VSpacer size={24} />
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>
              {I18n.t("bonus.sv.voucherList.details.fields.beneficiary")}
            </H4>
            <HSpacer size={16} />
            <H4 style={{ flexShrink: 1 }}>{selectedVoucher.beneficiary}</H4>
          </View>
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>
              {I18n.t("bonus.sv.voucherList.details.fields.residence.label")}
            </H4>
            <H4>
              {I18n.t("bonus.sv.voucherList.details.fields.residence.value")}
            </H4>
          </View>
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>
              {I18n.t("bonus.sv.voucherList.details.fields.category")}
            </H4>
            <H4>{selectedVoucher.category}</H4>
          </View>

          {fromVoucherToDestinationLabels(selectedVoucher).map(d => (
            <View style={styles.itemRow} key={d.value}>
              <H4 weight={"Regular"}>{d.label}</H4>
              <HSpacer size={16} />
              <H4 style={{ flexShrink: 1 }}>{d.value}</H4>
            </View>
          ))}
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>
              {I18n.t("bonus.sv.voucherList.details.fields.flightDate")}
            </H4>
            <H4>
              {formatDateAsLocal(selectedVoucher.departureDate, true, true)}
            </H4>
          </View>
          <VSpacer size={24} />
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>
              {I18n.t(
                "bonus.sv.voucherList.details.fields.possibleDestination"
              )}
            </H4>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              {selectedVoucher.availableDestination.map(d => (
                <H4 style={{ textAlign: "right" }} key={d}>
                  {d}
                </H4>
              ))}
            </View>
          </View>
        </ScrollView>
        <FooterWithButtons
          type={"TwoButtonsInlineHalf"}
          leftButton={voucherRevocationButtonProps}
          rightButton={openQrButtonProps}
        />
        {bottomSheet}
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => navigateBack(),
  voucherRevocationRequest: (voucherId: SvVoucherId) =>
    dispatch(svVoucherRevocation.request(voucherId)),
  getVoucherDetail: (voucherId: SvVoucherId) =>
    dispatch(svVoucherDetailGet.request(voucherId)),
  stampaVoucher: (voucherId: SvVoucherId) =>
    dispatch(svGetPdfVoucher.request(voucherId))
});
const mapStateToProps = (state: GlobalState) => ({
  selectedVoucher: selectedVoucherSelector(state),
  selectedVoucherCode: selectedVoucherCodeSelector(state),
  revocationState: selectedVoucherRevocationStateSelector(state),
  pdfVoucherState: selectedPdfVoucherStateSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VoucherDetailsScreen);
