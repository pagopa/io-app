import * as React from "react";
import { useCallback } from "react";
import { View } from "native-base";
import { Millisecond } from "italia-ts-commons/lib/units";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { StyleSheet } from "react-native";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import I18n from "../../../../../../i18n";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import IconFont from "../../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../../components/core/variables/IOColors";
import Eye from "../../../../../../../img/icons/Eye.svg";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { H3 } from "../../../../../../components/core/typography/H3";

type Props = {
  staticCode: Discount["staticCode"];
  onCodePress: (eventName: string) => void;
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

const FEEDBACK_TIMEOUT = 3000 as Millisecond;
const COPY_ICON_SIZE = 24;

const CgnStaticCodeComponent: React.FunctionComponent<Props> = ({
  staticCode,
  onCodePress
}: Props) => {
  const [isTap, setIsTap] = React.useState(false);
  const [isCodeVisible, setIsCodeVisible] = React.useState(false);
  const timerRetry = React.useRef<number | undefined>(undefined);

  React.useEffect(
    () => () => {
      clearTimeout(timerRetry.current);
    },
    []
  );

  const handleCopyPress = useCallback(() => {
    if (staticCode) {
      setIsTap(true);
      clipboardSetStringWithFeedback(staticCode);
      // eslint-disable-next-line functional/immutable-data
      timerRetry.current = setTimeout(() => setIsTap(false), FEEDBACK_TIMEOUT);
    }
  }, [staticCode]);

  const requestStaticCode = useCallback(() => {
    onCodePress("CGN_STATIC_CODE_REQUEST");
    setIsCodeVisible(true);
  }, [onCodePress]);

  return (
    <>
      <H3 accessible={true} accessibilityRole={"header"}>
        {I18n.t("bonus.cgn.merchantDetail.title.discountCode")}
      </H3>
      <TouchableWithoutFeedback
        onPress={isCodeVisible ? handleCopyPress : requestStaticCode}
        accessible={true}
        accessibilityRole={"button"}
        accessibilityHint={I18n.t("bonus.cgn.accessibility.code")}
        testID={"static-code-component"}
      >
        <View style={[styles.row, styles.codeContainer]}>
          <BaseTypography
            weight={"Bold"}
            color={"bluegreyDark"}
            font={"RobotoMono"}
            style={styles.codeText}
          >
            {isCodeVisible && staticCode ? staticCode : "••••••••••"}
          </BaseTypography>

          {isCodeVisible ? (
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
export default CgnStaticCodeComponent;
