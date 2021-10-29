import React from "react";
import { View } from "native-base";
import { BottomSheetContent } from "../../../../components/bottomSheet/BottomSheetContent";
import FooterWithButtons from "../../../../components/ui/FooterWithButtons";
import I18n from "../../../../i18n";
import { NetworkError } from "../../../../utils/errors";
import { isLoading, RemoteValue } from "../../bpd/model/RemoteValue";
import VoucherInformationComponent from "./VoucherInformationComponent";

type Props = {
  qrCode: string;
  barCode: string;
  onExit?: () => void;
  onSaveVoucher: () => void;
  pdfVoucherState: RemoteValue<string, NetworkError>;
};

const VoucherDetailBottomSheet = (props: Props): React.ReactElement => (
  <BottomSheetContent
    footer={
      <FooterWithButtons
        type={"TwoButtonsInlineHalf"}
        leftButton={{
          bordered: true,
          onPress: props.onExit,
          title: I18n.t("bonus.sv.components.voucherBottomsheet.cta.exit"),
          onPressWithGestureHandler: true
        }}
        rightButton={{
          primary: true,
          onPress: props.onSaveVoucher,
          title: I18n.t("global.genericSave"),
          onPressWithGestureHandler: true,
          disabled: isLoading(props.pdfVoucherState)
        }}
      />
    }
  >
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

export default VoucherDetailBottomSheet;
