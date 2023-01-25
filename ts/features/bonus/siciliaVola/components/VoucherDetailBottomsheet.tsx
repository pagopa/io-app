import React from "react";
import { View } from "react-native";
import { NetworkError } from "../../../../utils/errors";
import { RemoteValue } from "../../bpd/model/RemoteValue";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import VoucherInformationComponent from "./VoucherInformationComponent";

type Props = {
  qrCode: string;
  barCode: string;
  pdfVoucherState: RemoteValue<string, NetworkError>;
};

const VoucherDetailBottomSheet = (props: Props): React.ReactElement => (
  <View>
    <VSpacer size={16} />
    <VoucherInformationComponent
      voucherCode={"1324123"}
      onPressWithGestureHandler={true}
      barCode={props.barCode}
      qrCode={props.qrCode}
    />
  </View>
);

export default VoucherDetailBottomSheet;
