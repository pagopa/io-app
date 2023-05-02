import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import * as React from "react";
import { useEffect, useRef } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { Discount } from "../../../../../../../definitions/cgn/merchants/Discount";
import { InfoBox } from "../../../../../../components/box/InfoBox";
import { VSpacer } from "../../../../../../components/core/spacer/Spacer";
import { BaseTypography } from "../../../../../../components/core/typography/BaseTypography";
import { H3 } from "../../../../../../components/core/typography/H3";
import { H4 } from "../../../../../../components/core/typography/H4";
import { IOStyles } from "../../../../../../components/core/variables/IOStyles";
import ActivityIndicator from "../../../../../../components/ui/ActivityIndicator";
import I18n from "../../../../../../i18n";
import { useIODispatch, useIOSelector } from "../../../../../../store/hooks";
import { clipboardSetStringWithFeedback } from "../../../../../../utils/clipboard";
import { isError, isLoading, isReady } from "../../../../bpd/model/RemoteValue";
import {
  cgnCodeFromBucket,
  cgnCodeFromBucketReset
} from "../../../store/actions/bucket";
import { cgnBucketSelector } from "../../../store/reducers/bucket";
import { isDiscountBucketCodeResponseSuccess } from "../../../types/DiscountBucketCodeResponse";
import { Icon } from "../../../../../../components/core/icons/Icon";

type Props = {
  discountId: Discount["id"];
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

const COPY_ICON_SIZE = 24;
const FEEDBACK_TIMEOUT = 3000 as Millisecond;
const EMPTY_CODE_CONTENT = "••••••••••";
type ContentProps = {
  onRequestBucket: () => void;
};

const BucketCodeHandler = ({
  onPress,
  content,
  icon
}: {
  onPress: () => void;
  content: string;
  icon: React.ReactElement;
}) => (
  <TouchableWithoutFeedback
    onPress={onPress}
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
        {content}
      </BaseTypography>

      {icon}
    </View>
  </TouchableWithoutFeedback>
);
const CgnBucketCodeContent = (props: ContentProps) => {
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

  useEffect(() => {
    if (
      isError(bucketResponse) ||
      (isReady(bucketResponse) && bucketResponse.value.kind === "unhandled")
    ) {
      showAlertError();
    }
  }, [bucketResponse]);

  if (isLoading(bucketResponse)) {
    return <ActivityIndicator />;
  }

  // we got an error no code is available
  if (isReady(bucketResponse) && bucketResponse.value.kind === "notFound") {
    return (
      <>
        <InfoBox
          iconColor="aqua"
          iconName="legError"
          iconSize={24}
          alignedCentral
        >
          <H4 weight={"Regular"} style={IOStyles.flex}>
            {I18n.t("bonus.cgn.merchantDetail.bucket.error.noCode")}
          </H4>
        </InfoBox>
      </>
    );
  }

  if (isReady(bucketResponse) && bucketResponse.value.kind === "success") {
    return (
      <BucketCodeHandler
        onPress={handleCopyPress}
        content={bucketResponse.value.value.code}
        icon={
          <View style={styles.flexEnd}>
            <Icon
              name={isTap ? "ok" : "copy"}
              size={COPY_ICON_SIZE}
              color="blue"
            />
          </View>
        }
      />
    );
  }

  return (
    <BucketCodeHandler
      onPress={props.onRequestBucket}
      content={EMPTY_CODE_CONTENT}
      icon={<Icon size={COPY_ICON_SIZE} name="eyeShow" color="blue" />}
    />
  );
};
const CgnBucketCodeComponent = ({ discountId, onCodePress }: Props) => {
  const dispatch = useIODispatch();

  const requestBucketCode = () => {
    onCodePress("CGN_BUCKET_CODE_START_REQUEST");
    dispatch(cgnCodeFromBucket.request(discountId));
  };
  useEffect(
    () => () => {
      dispatch(cgnCodeFromBucketReset());
    },
    [dispatch]
  );

  return (
    <View testID={"bucket-code-component"}>
      <H3 accessible={true} accessibilityRole={"header"}>
        {I18n.t("bonus.cgn.merchantDetail.title.discountCode")}
      </H3>
      <VSpacer size={8} />
      <CgnBucketCodeContent onRequestBucket={requestBucketCode} />
    </View>
  );
};

export default CgnBucketCodeComponent;
