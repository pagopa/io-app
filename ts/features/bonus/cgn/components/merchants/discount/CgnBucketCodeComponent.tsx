import * as React from "react";
import { useEffect, useRef } from "react";
import { View } from "native-base";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { Alert, StyleSheet } from "react-native";
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
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { isDiscountBucketCodeResponseSuccess } from "../../../types/DiscountBucketCodeResponse";
import { H4 } from "../../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import { InfoBox } from "../../../../../../components/box/InfoBox";

type Props = {
  discountId: Discount["id"];
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
  const timerRetry = useRef<number | undefined>(undefined);

  const bucketResponse = useIOSelector(cgnBucketSelector);

  const handleCopyPress = () => {
    if (
      isReady(bucketResponse) &&
      isDiscountBucketCodeResponseSuccess(bucketResponse.value)
    ) {
      setIsTap(true);
      clipboardSetStringWithFeedback(bucketResponse.value.value.code);
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

  const showAlertError = () =>
    Alert.alert(
      I18n.t(
        "bonus.bonusVacanze.eligibility.activateBonus.discrepancies.attention"
      ),
      I18n.t("bonus.cgn.otp.error"),
      [
        {
          text: I18n.t("bonus.cgn.merchantDetail.bucket.alert.cta"),
          style: "cancel"
        }
      ]
    );

  if (isLoading(bucketResponse)) {
    return <ActivityIndicator />;
  }

  if (isError(bucketResponse)) {
    return (
      <TouchableWithoutFeedback
        onPress={showAlertError}
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
  }

  // we got an error no code is available
  if (isReady(bucketResponse) && bucketResponse.value.kind === "notFound") {
    return (
      <>
        <H3 accessible={true} accessibilityRole={"header"}>
          {I18n.t("bonus.cgn.merchantDetail.title.discountCode")}
        </H3>
        <View spacer small />
        <InfoBox
          iconColor={IOColors.aqua}
          iconName={"io-error"}
          iconSize={24}
          alignedCentral
        >
          <H4 weight={"Regular"} style={[IOStyles.flex]}>
            {I18n.t("bonus.cgn.merchantDetail.bucket.error.noCode")}
          </H4>
        </InfoBox>
      </>
    );
  }

  return (
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
          {isCodeVisible &&
          isReady(bucketResponse) &&
          isDiscountBucketCodeResponseSuccess(bucketResponse.value)
            ? addEvery(bucketResponse.value.value.code, " ", 3)
            : "••••••••••"}
        </BaseTypography>

        {isCodeVisible &&
        isReady(bucketResponse) &&
        isDiscountBucketCodeResponseSuccess(bucketResponse.value) ? (
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
  );
};
const CgnBucketCodeComponent = ({ discountId }: Props) => {
  const dispatch = useIODispatch();

  useEffect(() => {
    dispatch(cgnCodeFromBucket.request(discountId));
  }, []);

  return (
    <View testID={"bucket-code-component"}>
      <H3 accessible={true} accessibilityRole={"header"}>
        {I18n.t("bonus.cgn.merchantDetail.title.discountCode")}
      </H3>
      <View spacer small />
      <CgnBucketCodeContent />
    </View>
  );
};

export default CgnBucketCodeComponent;
