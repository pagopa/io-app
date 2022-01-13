import * as React from "react";
import { useEffect } from "react";
import { View } from "native-base";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { Millisecond } from "italia-ts-commons/lib/units";
import I18n from "../../../../../../i18n";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { isError, isLoading, isReady } from "../../../../bpd/model/RemoteValue";
import Eye from "../../../../../../../img/icons/Eye.svg";
import ActivityIndicator from "../../../../../../components/ui/ActivityIndicator";
import { cgnBucketSelector } from "../../../store/reducers/bucket";
import { cgnCodeFromBucket } from "../../../store/actions/bucket";
import { addEvery } from "../../../../../../utils/strings";
import IconFont from "../../../../../../components/ui/IconFont";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import { H3 } from "../../../../../../components/core/typography/H3";

type Props = {
  discountId: string;
};

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

const CgnBucketCodeContent = () => {
  const [isCodeVisible, setIsCodeVisible] = React.useState(false);
  const [isTap, setIsTap] = React.useState(false);
  const timerRetry = React.useRef<number | undefined>(undefined);

  const code = useIOSelector(cgnBucketSelector);

  const handleCopyPress = () => {
    if (isReady(code)) {
      setIsTap(true);
      clipboardSetStringWithFeedback(code.value.code);
      // eslint-disable-next-line functional/immutable-data
      timerRetry.current = setTimeout(() => setIsTap(false), FEEDBACK_TIMEOUT);
    }
  };

  useEffect(
    () => () => {
      if (timerRetry.current) {
        clearTimeout(timerRetry.current);
      }
    },
    []
  );

  if (isLoading(code)) {
    return <ActivityIndicator />;
  }

  // we got an error no code is available
  if (isError(code)) {
    return null;
  }

  return (
    <>
      <H3 accessible={true} accessibilityRole={"header"}>
        {I18n.t("bonus.cgn.merchantDetail.title.discountCode")}
      </H3>
      <TouchableWithoutFeedback
        onPress={isCodeVisible ? handleCopyPress : () => setIsCodeVisible(true)}
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
              ? addEvery(code.value.code, " ", 3)
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
    </>
  );
};

const CgnBucketCodeComponent = ({ discountId }: Props) => {
  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(cgnCodeFromBucket.request(discountId));
  }, []);

  return (
    <View testID={"bucket-code-component"}>
      <CgnBucketCodeContent />
    </View>
  );
};

export default CgnBucketCodeComponent;
