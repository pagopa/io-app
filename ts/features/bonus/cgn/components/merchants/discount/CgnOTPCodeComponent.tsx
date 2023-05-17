import * as React from "react";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { View, StyleSheet } from "react-native";
import I18n from "../../../../../../i18n";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { cgnOtpDataSelector } from "../../../store/reducers/otp";
import { isError, isLoading, isReady } from "../../../../bpd/model/RemoteValue";
import { cgnGenerateOtp, resetOtpState } from "../../../store/actions/otp";
import ActivityIndicator from "../../../../../../components/ui/ActivityIndicator";
import { Link } from "../../../../../../components/core/typography/Link";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../../../components/core/typography/H3";
import { H4 } from "../../../../../../components/core/typography/H4";
import { Icon } from "../../../../../../components/core/icons/Icon";
import { OtpCodeComponent } from "./OtpCodeComponent";

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  codeContainer: { alignItems: "center", justifyContent: "space-between" },
  codeText: {
    fontSize: 20
  }
});

const COPY_ICON_SIZE = 24;

type Props = {
  onCodePress: (eventName: string) => void;
};

const CgnOTPCodeContent = ({ onCodePress }: Props) => {
  const [isCodeVisible, setIsCodeVisible] = React.useState(false);
  const dispatch = useIODispatch();
  const otp = useIOSelector(cgnOtpDataSelector);

  const requestOtp = () => {
    onCodePress("CGN_OTP_START_REQUEST");
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
            <H4 weight={"Regular"} style={IOStyles.flex}>
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

        <Icon size={COPY_ICON_SIZE} color="blue" name={"legEyeShow"} />
      </View>
    </TouchableWithoutFeedback>
  );
};

const CgnOTPCodeComponent = (props: Props) => (
  <View testID={"otp-code-component"}>
    <H3 accessible={true} accessibilityRole={"header"}>
      {I18n.t("bonus.cgn.merchantDetail.title.discountCode")}
    </H3>
    <CgnOTPCodeContent {...props} />
  </View>
);

export default CgnOTPCodeComponent;
