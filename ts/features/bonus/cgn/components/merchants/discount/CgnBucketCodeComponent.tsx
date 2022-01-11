import * as React from "react";
import { View } from "native-base";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { Millisecond } from "italia-ts-commons/lib/units";
import I18n from "../../../../../../i18n";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { isLoading, isReady } from "../../../../bpd/model/RemoteValue";
import Eye from "../../../../../../../img/icons/Eye.svg";
import ActivityIndicator from "../../../../../../components/ui/ActivityIndicator";
import { cgnBucketSelector } from "../../../store/reducers/bucket";
import { cgnCodeFromBucket } from "../../../store/actions/bucket";
import { addEvery } from "../../../../../../utils/strings";
import IconFont from "../../../../../../components/ui/IconFont";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";

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
const FEEDBACK_TIMEOUT = 3000 as Millisecond;

const CgnBucketCodeComponent = () => {
  const [isCodeVisible, setIsCodeVisible] = React.useState(false);
  const [isTap, setIsTap] = React.useState(false);
  const timerRetry = React.useRef<number | undefined>(undefined);

  const dispatch = useIODispatch();
  const code = useIOSelector(cgnBucketSelector);

  const requestBucket = () => {
    dispatch(cgnCodeFromBucket.request());
    setIsCodeVisible(true);
  };

  const handleCopyPress = () => {
    if (isReady(code)) {
      setIsTap(true);
      clipboardSetStringWithFeedback(code.value.code);
      // eslint-disable-next-line functional/immutable-data
      timerRetry.current = setTimeout(() => setIsTap(false), FEEDBACK_TIMEOUT);
    }
  };

  return (
    <View testID={"bucket-code-component"}>
      {isLoading(code) ? (
        <ActivityIndicator />
      ) : (
        <TouchableWithoutFeedback
          onPress={isCodeVisible ? handleCopyPress : requestBucket}
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
              {isCodeVisible && isReady(code)
                ? addEvery(code.value.code, " ", 4)
                : "••••••••••"}
            </BaseTypography>

            {isCodeVisible && isReady(code) ? (
              <IconFont
                name={isTap ? "io-complete" : "io-copy"}
                size={COPY_ICON_SIZE}
                color={IOColors.blue}
                style={styles.flexEnd}
              />
            ) : (
              <Eye
                width={COPY_ICON_SIZE}
                height={COPY_ICON_SIZE}
                fill={IOColors.blue}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default CgnBucketCodeComponent;
