import * as React from "react";
import { View } from "native-base";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import I18n from "../../../../../../i18n";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { cgnOtpDataSelector } from "../../../store/reducers/otp";
import { isError, isLoading, isReady } from "../../../../bpd/model/RemoteValue";
import { cgnGenerateOtp, resetOtpState } from "../../../store/actions/otp";
import { OtpCodeComponent } from "../../otp/OtpCodeComponent";
import Eye from "../../../../../../../img/icons/Eye.svg";
import ActivityIndicator from "../../../../../../components/ui/ActivityIndicator";
import { Link } from "../../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { H4 } from "../../../../../../components/core/typography/H4";

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

const CgnOTPCodeContent = () => {
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

  if (isLoading(otp)) {
    return <ActivityIndicator />;
  }

  if (isCodeVisible) {
    if (isReady(otp)) {
      return (
        <OtpCodeComponent
          otp={otp.value}
          onEnd={resetOtp}
          progressConfig={{
            startPercentage: 100,
            endPercentage: 0
          }}
        />
      );
    }
    if (isError(otp)) {
      return (
        <TouchableWithoutFeedback
          onPress={requestOtp}
          accessible={true}
          accessibilityRole={"button"}
          accessibilityHint={I18n.t("bonus.cgn.accessibility.code")}
        >
          <View>
            <H4 weight={"Regular"} style={[IOStyles.flex]}>
              {I18n.t("bonus.cgn.otp.error")}
            </H4>

            <Link>{I18n.t("global.buttons.retry")}</Link>
          </View>
        </TouchableWithoutFeedback>
      );
    }
  }

  return (
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

const CgnOTPCodeComponent = () => (
  <View testID={"otp-code-component"}>
    <CgnOTPCodeContent />
  </View>
);

export default CgnOTPCodeComponent;
