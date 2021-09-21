import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { SafeAreaView, ScrollView, StyleSheet } from "react-native";
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
import { svVoucherDetailGet } from "../../store/actions/voucherList";
import { SvVoucherId } from "../../types/SvVoucher";
import {
  selectedVoucherCodeSelector,
  selectedVoucherSelector
} from "../../store/reducers/selectedVoucher";
import { View } from "native-base";
import { H3 } from "../../../../../components/core/typography/H3";
import CopyButtonComponent from "../../../../../components/CopyButtonComponent";
import { isLoading, isReady } from "../../../bpd/model/RemoteValue";
import { H4 } from "../../../../../components/core/typography/H4";
import { formatDateAsLocal } from "../../../../../utils/dates";
import { useIOBottomSheetRaw } from "../../../../../utils/bottomSheet";
import VoucherInformationComponent from "../../components/VoucherInformationComponent";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { BottomSheetContent } from "../../../../../components/bottomSheet/BottomSheetContent";
import { LoadingErrorComponent } from "../../../bonusVacanze/components/loadingErrorScreen/LoadingErrorComponent";

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

const styles = StyleSheet.create({
  itemRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

type bottomSheetProps = {
  qrCode: string;
  barCode: string;
};

export const ShowVoucherCodeBottomSheet = (props: bottomSheetProps) => (
  <BottomSheetContent>
    <View>
      <View spacer={true} />
      <VoucherInformationComponent
        voucherCode={"1324123"}
        onPressWithGestureHandler={true}
        barCode={props.barCode}
        qrCode={props.qrCode}
      />
    </View>
  </BottomSheetContent>
);

const VoucherDetailsScreen = (props: Props): React.ReactElement => {
  useEffect(() => {
    if (props.selectedVoucherCode !== undefined) {
      props.getVoucherDetail(props.selectedVoucherCode);
    }
  }, []);

  if (!isReady(props.selectedVoucher)) {
    return (
      <LoadingErrorComponent
        isLoading={isLoading(props.selectedVoucher)}
        loadingCaption={"loading"}
        onRetry={() => true}
      />
    );
  }

  const { present, dismiss } = useIOBottomSheetRaw(650);
  const selectedVoucher = props.selectedVoucher.value;
  const openBottomSheet = () =>
    present(
      <ShowVoucherCodeBottomSheet
        barCode={selectedVoucher.barCode}
        qrCode={selectedVoucher.qrCode}
      />,
      I18n.t("wallet.newRemove.title")
    );
  const backButtonProps = {
    bordered: true,
    style: {
      borderColor: IOColors.red
    },
    textStyle: {
      color: IOColors.red
    },
    color: IOColors.red,
    onPress: props.back,
    title: "Revoca codice"
  };
  const continueButtonProps = {
    primary: true,
    bordered: false,
    onPress: () => openBottomSheet(),
    title: "Apri QR code"
  };

  const destination = () => {
    switch (selectedVoucher.category) {
      case "student":
        return [
          {
            label: "Nome ateneo",
            value: selectedVoucher.university.universityName
          },
          {
            label: "Comune",
            value: selectedVoucher.university.municipality.name
          }
        ];
      case "worker":
        return [
          {
            label: "Nome azienda",
            value: selectedVoucher.company.businessName
          },
          {
            label: "Comune",
            value: selectedVoucher.company.municipality.name
          }
        ];
      case "sick":
        return [
          {
            label: "Nome azienda",
            value: selectedVoucher.hospital.hospitalName
          },
          {
            label: "Comune",
            value: selectedVoucher.hospital.municipality.name
          }
        ];
    }
    return [];
  };

  const voucherId = selectedVoucher.id ? selectedVoucher.id.toString() : "";

  return (
    <BaseScreenComponent
      goBack={true}
      contextualHelp={emptyContextualHelp}
      headerTitle={I18n.t("bonus.sv.headerTitle")}
    >
      <SafeAreaView style={IOStyles.flex} testID={"VoucherGeneratedScreen"}>
        <ScrollView style={[IOStyles.horizontalContentPadding]}>
          <H1>{"Il tuo codice sconto"}</H1>
          <View spacer large />
          <View style={styles.itemRow}>
            <H4>{"Codice univoco"}</H4>

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
            <H4 weight={"Regular"}>{"Beneficiario"}</H4>
            <H4>{selectedVoucher.beneficiary}</H4>
          </View>
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>{"Residenza"}</H4>
            <H4>{"Sicilia"}</H4>
          </View>
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>{"Categoria"}</H4>
            <H4>{selectedVoucher.category}</H4>
          </View>

          {destination().map(d => (
            <View style={styles.itemRow}>
              <H4 weight={"Regular"}>{d.label}</H4>
              <H4>{d.value}</H4>
            </View>
          ))}
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>{"Data del volo"}</H4>
            <H4>
              {formatDateAsLocal(selectedVoucher.departureDate, true, true)}
            </H4>
          </View>
          <View spacer large />
          <View style={styles.itemRow}>
            <H4 weight={"Regular"}>{"Possibili destinazioni"}</H4>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              {selectedVoucher.availableDestination.map(d => (
                <H4 key={d}>{d}</H4>
              ))}
            </View>
          </View>
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
    dispatch(svGenerateVoucherGeneratedVoucher.request(voucherRequest)),
  getVoucherDetail: (voucherId: SvVoucherId) =>
    dispatch(svVoucherDetailGet.request(voucherId))
});
const mapStateToProps = (state: GlobalState) => ({
  selectedVoucher: selectedVoucherSelector(state),
  selectedVoucherCode: selectedVoucherCodeSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VoucherDetailsScreen);
