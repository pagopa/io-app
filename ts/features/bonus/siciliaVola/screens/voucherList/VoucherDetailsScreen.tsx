import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { Alert, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { View } from "native-base";
import { fromNullable } from "fp-ts/lib/Option";
import BaseScreenComponent from "../../../../../components/screens/BaseScreenComponent";
import { emptyContextualHelp } from "../../../../../utils/emptyContextualHelp";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H1 } from "../../../../../components/core/typography/H1";
import { GlobalState } from "../../../../../store/reducers/types";
import FooterWithButtons from "../../../../../components/ui/FooterWithButtons";
import I18n from "../../../../../i18n";
import {
  svVoucherDetailGet,
  svVoucherRevocation
} from "../../store/actions/voucherList";
import { SvVoucherId } from "../../types/SvVoucher";
import {
  selectedVoucherCodeSelector,
  selectedVoucherRevocationStateSelector,
  selectedVoucherSelector
} from "../../store/reducers/selectedVoucher";
import { H3 } from "../../../../../components/core/typography/H3";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { isError, isLoading, isReady } from "../../../bpd/model/RemoteValue";
import { H4 } from "../../../../../components/core/typography/H4";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { useIOBottomSheetRaw } from "../../../../../utils/bottomSheet";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";
import VoucherDetailBottomSheet from "../../components/VoucherDetailBottomsheet";
import { fromVoucherToDestinationLabels } from "../../utils";
import { navigateBack } from "../../../../../store/actions/navigation";
import { showToast } from "../../../../../utils/showToast";

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
  const { selectedVoucherCode, getVoucherDetail, revocationState, back } =
    props;

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

  const { present, dismiss } = useIOBottomSheetRaw(650);

  // The selectedVoucherCode can't be undefined in this screen
  if (!isReady(props.selectedVoucher)) {
    return fromNullable(selectedVoucherCode).fold(null, svc => (
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
    ));
  }

  const selectedVoucher = props.selectedVoucher.value;
  const openBottomSheet = () =>
    present(
      <VoucherDetailBottomSheet
        barCode={selectedVoucher.barCode}
        qrCode={selectedVoucher.qrCode}
        onExit={dismiss}
      />,
      I18n.t("bonus.sv.components.voucherBottomsheet.title")
    );
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
  const openQrButtonProps = {
    primary: true,
    bordered: false,
    onPress: openBottomSheet,
    title: I18n.t("bonus.sv.voucherList.details.cta.openQr")
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

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"VoucherGeneratedScreen"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{I18n.t("bonus.sv.voucherList.details.title")}</H1>
          <View spacer large />
          <View style={styles.itemRow}>
            <H4>{I18n.t("bonus.sv.voucherList.details.fields.uniqueCode")}</H4>

            <View
              style={{
                flexDirection: "row"
              }}
            >
              <H3 color={"bluegreyDark"}>{voucherId}</H3>
              <View hspacer />
              <CopyButtonComponent textToCopy={voucherId} />
            </View>
          </View>
          <View spacer large />
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>
              {I18n.t("bonus.sv.voucherList.details.fields.beneficiary")}
            </H4>
            <View hspacer />
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
              <View hspacer />
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
          <View spacer large />
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
      </SafeAreaView>
    </BaseScreenComponent>
  );
};
const mapDispatchToProps = (dispatch: Dispatch) => ({
  back: () => dispatch(navigateBack()),
  voucherRevocationRequest: (voucherId: SvVoucherId) =>
    dispatch(svVoucherRevocation.request(voucherId)),
  getVoucherDetail: (voucherId: SvVoucherId) =>
    dispatch(svVoucherDetailGet.request(voucherId))
});
const mapStateToProps = (state: GlobalState) => ({
  selectedVoucher: selectedVoucherSelector(state),
  selectedVoucherCode: selectedVoucherCodeSelector(state),
  revocationState: selectedVoucherRevocationStateSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VoucherDetailsScreen);
