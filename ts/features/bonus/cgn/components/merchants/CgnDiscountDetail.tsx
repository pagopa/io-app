import * as React from "react";
import { View } from "native-base";
import { StyleSheet } from "react-native";
import { TouchableWithoutFeedback } from "@gorhom/bottom-sheet";
import { TmpDiscountType } from "../../__mock__/availableMerchantDetail";
import { useIOBottomSheet } from "../../../../../utils/bottomSheet";
import I18n from "../../../../../i18n";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import { H3 } from "../../../../../components/core/typography/H3";
import { H5 } from "../../../../../components/core/typography/H5";
import { H4 } from "../../../../../components/core/typography/H4";
import IconFont from "../../../../../components/ui/IconFont";
import { IOColors } from "../../../../../components/core/variables/IOColors";
import { Monospace } from "../../../../../components/core/typography/Monospace";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";

type Props = {
  discount: TmpDiscountType;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  verticalPadding: {
    paddingBottom: 16
  },
  discountValueBox: {
    borderRadius: 6.5,
    paddingVertical: 5,
    width: 40,
    textAlign: "center",
    backgroundColor: "#EB9505"
  },
  container: {
    paddingTop: 16
  }
});

const PERCENTAGE_SYMBOL = "%";
const FEEDBACK_MS = 3000;

const CgnDiscountDetail: React.FunctionComponent<Props> = ({
  discount
}: Props) => {
  const [isTap, setIsTap] = React.useState(false);
  const timerRetry = React.useRef<number | undefined>(undefined);

  React.useEffect(
    () => () => {
      clearTimeout(timerRetry.current);
    },
    []
  );

  const handleCopyPress = () => {
    if (discount.discountCode) {
      setIsTap(true);
      clipboardSetStringWithFeedback(discount.discountCode);
      // eslint-disable-next-line functional/immutable-data
      timerRetry.current = setTimeout(() => setIsTap(false), FEEDBACK_MS);
    }
  };

  return (
    <View style={styles.container}>
      <View style={IOStyles.row}>
        {/* TODO when available and defined the icon name should be defined through a map of category codes */}
        <IconFont name={"io-theater"} size={22} color={IOColors.bluegrey} />
        <View hspacer small />
        <H5 weight={"SemiBold"} color={"bluegrey"}>
          {discount.category.toLocaleUpperCase()}
        </H5>
      </View>
      <View spacer />
      <H3>{I18n.t("bonus.cgn.merchantDetail.title.description")}</H3>
      <H4 weight={"Regular"}>{discount.description}</H4>
      <View spacer />
      <H3>{I18n.t("bonus.cgn.merchantDetail.title.validity")}</H3>
      <H4 weight={"Regular"}>{discount.validityDescription}</H4>
      {discount.discountCode !== undefined && (
        <>
          <View spacer small />
          <H3>{I18n.t("bonus.cgn.merchantDetail.title.discountCode")}</H3>
          <TouchableWithoutFeedback onPress={handleCopyPress}>
            <View
              style={[
                IOStyles.row,
                { alignItems: "center", justifyContent: "space-between" }
              ]}
            >
              <Monospace weight={"Bold"} color={"bluegrey"}>
                {discount.discountCode}
              </Monospace>
              <IconFont
                name={isTap ? "io-complete" : "io-copy"}
                size={24}
                color={IOColors.blue}
                style={{ alignSelf: "flex-end" }}
              />
            </View>
          </TouchableWithoutFeedback>
        </>
      )}
      <View spacer />
      <H3>{I18n.t("bonus.cgn.merchantDetail.title.conditions")}</H3>
      <H4 weight={"Regular"}>{discount.conditions}</H4>
    </View>
  );
};

const CgnDiscountDetailHeader: React.FunctionComponent<Props> = ({
  discount
}: Props) => (
  <View style={[IOStyles.row, { alignItems: "center" }]}>
    <View style={styles.discountValueBox}>
      <H4
        weight={"Bold"}
        color={"white"}
        style={{ textAlign: "center", lineHeight: 30 }}
      >
        {`${discount.value}`}
        <H5 weight={"SemiBold"} color={"white"}>
          {PERCENTAGE_SYMBOL}
        </H5>
      </H4>
    </View>
    <View hspacer />
    <H3>{discount.title}</H3>
  </View>
);

export const useCgnDiscountDetailBottomSheet = (discount: TmpDiscountType) =>
  useIOBottomSheet(
    <CgnDiscountDetail {...{ discount }} />,
    <CgnDiscountDetailHeader {...{ discount }} />,
    520
  );
