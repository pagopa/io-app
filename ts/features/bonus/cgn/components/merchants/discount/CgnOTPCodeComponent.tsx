import * as React from "react";
import { View } from "native-base";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import { Millisecond } from "italia-ts-commons/lib/units";
import I18n from "../../../../../../i18n";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { cgnOtpDataSelector } from "../../../store/reducers/otp";
import { isReady } from "../../../../bpd/model/RemoteValue";
import { cgnGenerateOtp, resetOtpState } from "../../../store/actions/otp";
import { OtpCodeComponent } from "../../otp/OtpCodeComponent";
import Eye from "../../../../../../../img/icons/Eye.svg";

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

const FEEDBACK_TIMEOUT = 3000 as Millisecond;
const COPY_ICON_SIZE = 24;

const CgnOTPCodeComponent = () => {
  const [isCopyTap, setIsCopyTap] = React.useState(false);
  const [isCodeVisible, setIsCodeVisible] = React.useState(false);
  const timerRetry = React.useRef<number | undefined>(undefined);

  const dispatch = useIODispatch();
  const otp = useIOSelector(cgnOtpDataSelector);

  React.useEffect(
    () => () => {
      clearTimeout(timerRetry.current);
    },
    []
  );

  const handleCopyPress = () => {
    if (isReady(otp)) {
      setIsCopyTap(true);
      clipboardSetStringWithFeedback(otp.value.code);
      // eslint-disable-next-line functional/immutable-data
      timerRetry.current = setTimeout(
        () => setIsCopyTap(false),
        FEEDBACK_TIMEOUT
      );
    }
  };

  const requestOtp = () => {
    dispatch(cgnGenerateOtp.request());
    setIsCodeVisible(true);
  };

  const resetOtp = () => {
    dispatch(resetOtpState());
    setIsCodeVisible(false);
  };

  return (
    <TouchableWithoutFeedback
      onPress={isCodeVisible && isReady(otp) ? handleCopyPress : requestOtp}
      accessible={true}
      accessibilityRole={"button"}
      accessibilityHint={I18n.t("bonus.cgn.accessibility.code")}
    >
      {!isCodeVisible && !isReady(otp) && (
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
      )}
      {isReady(otp) && (
        <OtpCodeComponent
          otp={otp.value}
          onEnd={resetOtp}
          progressConfig={{
            startPercentage: 100,
            endPercentage: 0
          }}
        />
      )}
    </TouchableWithoutFeedback>
  );
};

export default CgnOTPCodeComponent;
