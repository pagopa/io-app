import * as React from "react";
import { View } from "native-base";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import I18n from "../../../../../../i18n";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { cgnOtpDataSelector } from "../../../store/reducers/otp";
import { isLoading, isReady } from "../../../../bpd/model/RemoteValue";
import { cgnGenerateOtp, resetOtpState } from "../../../store/actions/otp";
import { OtpCodeComponent } from "../../otp/OtpCodeComponent";
import Eye from "../../../../../../../img/icons/Eye.svg";
import ActivityIndicator from "../../../../../../components/ui/ActivityIndicator";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  codeContainer: { alignItems: "center", justifyContent: "space-between" },
  codeText: {
    fontSize: 20
  },
  flexEnd: { alignSelf: "flex-end" }
});

const COPY_ICON_SIZE = 24;

const CgnOTPCodeComponent = () => {
  const [isCodeVisible, setIsCodeVisible] = React.useState(false);

  const dispatch = useIODispatch();
  const otp = useIOSelector(cgnOtpDataSelector);

  const requestOtp = () => {
    dispatch(cgnGenerateOtp.request());
    setIsCodeVisible(true);
  };

  const resetOtp = () => {
    dispatch(resetOtpState());
    setIsCodeVisible(false);
  };

  return isLoading(otp) ? (
    <ActivityIndicator />
  ) : isCodeVisible && isReady(otp) ? (
    <OtpCodeComponent
      otp={otp.value}
      onEnd={resetOtp}
      progressConfig={{
        startPercentage: 100,
        endPercentage: 0
      }}
    />
  ) : (
    <TouchableWithoutFeedback
      onPress={requestOtp}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityHint={I18n.t("bonus.cgn.accessibility.code")}
    >
      <View style={[styles.row, styles.codeContainer]}>
        <BaseTypography
          weight={"Bold"}
          color={"bluegreyDark"}
          font={"RobotoMono"}
          style={styles.codeText}
        >
          {"••••••••••"}
        </BaseTypography>

        <Eye
          width={COPY_ICON_SIZE}
          height={COPY_ICON_SIZE}
          fill={IOColors.blue}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default CgnOTPCodeComponent;
