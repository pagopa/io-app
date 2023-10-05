import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import {
  HSpacer,
  VSpacer,
  Icon,
  IOIconSizeScale,
  ButtonOutline
} from "@pagopa/io-app-design-system";
import { Discount } from "../../../../../../definitions/cgn/merchants/Discount";
import {
  DiscountCodeType,
  DiscountCodeTypeEnum
} from "../../../../../../definitions/cgn/merchants/DiscountCodeType";
import { H3 } from "../../../../../components/core/typography/H3";
import { H4 } from "../../../../../components/core/typography/H4";
import { H5 } from "../../../../../components/core/typography/H5";
import { IOStyles } from "../../../../../components/core/variables/IOStyles";
import I18n from "../../../../../i18n";
import { mixpanelTrack } from "../../../../../mixpanel";
import { useIOSelector } from "../../../../../store/hooks";
import { profileSelector } from "../../../../../store/reducers/profile";
import { localeDateFormat } from "../../../../../utils/locale";
import { IOToast } from "../../../../../components/Toast";
import { openWebUrl } from "../../../../../utils/url";
import { getCgnUserAgeRange } from "../../utils/dates";
import { getCategorySpecs } from "../../utils/filters";
import CgnDiscountValueBox from "./CgnDiscountValueBox";
import CgnDiscountCodeComponent from "./discount/CgnDiscountCodeComponent";

type Props = {
  discount: Discount;
  operatorName: string;
  merchantType?: DiscountCodeType;
  onLandingCtaPress?: (url: string, referer: string) => void;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row"
  },
  container: {
    paddingTop: 16
  }
});

const CATEGORY_ICON_SIZE: IOIconSizeScale = 20;

export const CgnDiscountDetail: React.FunctionComponent<Props> = ({
  discount,
  operatorName,
  merchantType,
  onLandingCtaPress
}: Props) => {
  const profile = pot.toUndefined(useIOSelector(profileSelector));

  const cgnUserAgeRange = useMemo(
    () => getCgnUserAgeRange(profile?.date_of_birth),
    [profile]
  );

  const mixpanelCgnEvent = useCallback(
    (eventName: string) =>
      void mixpanelTrack(eventName, {
        userAge: cgnUserAgeRange,
        categories: discount.productCategories,
        operator_name: operatorName
      }),
    [cgnUserAgeRange, discount, operatorName]
  );

  return (
    <View style={[styles.container, IOStyles.flex]} testID={"discount-detail"}>
      <View style={[styles.row, IOStyles.flex, { flexWrap: "wrap" }]}>
        {discount.productCategories.map(categoryKey =>
          pipe(
            getCategorySpecs(categoryKey),
            O.fold(
              () => undefined,
              c => (
                <View
                  key={c.nameKey}
                  style={[
                    styles.row,
                    {
                      paddingRight: 8,
                      paddingBottom: 2,
                      marginRight: 8
                    }
                  ]}
                >
                  <Icon
                    name={c.icon}
                    size={CATEGORY_ICON_SIZE}
                    color="bluegrey"
                  />
                  <HSpacer size={8} />
                  <H5
                    weight={"SemiBold"}
                    color={"bluegrey"}
                    testID={"category-name"}
                  >
                    {I18n.t(c.nameKey).toLocaleUpperCase()}
                  </H5>
                </View>
              )
            )
          )
        )}
      </View>
      <VSpacer size={16} />
      {discount.description && (
        <>
          <H3 accessible={true} accessibilityRole={"header"}>
            {I18n.t("bonus.cgn.merchantDetail.title.description")}
          </H3>
          <H4 weight={"Regular"} testID={"discount-description"}>
            {discount.description}
          </H4>
          <VSpacer size={16} />
        </>
      )}
      <CgnDiscountCodeComponent
        discount={discount}
        merchantType={merchantType}
        onCodePress={mixpanelCgnEvent}
      />
      <H3 accessible={true} accessibilityRole={"header"}>
        {I18n.t("bonus.cgn.merchantDetail.title.validity")}
      </H3>
      <H4 weight={"Regular"}>{`${localeDateFormat(
        discount.startDate,
        I18n.t("global.dateFormats.shortFormat")
      )} - ${localeDateFormat(
        discount.endDate,
        I18n.t("global.dateFormats.shortFormat")
      )}`}</H4>
      <VSpacer size={16} />
      {discount.condition && (
        <>
          <H3 accessible={true} accessibilityRole={"header"}>
            {I18n.t("bonus.cgn.merchantDetail.title.conditions")}
          </H3>
          <H4 weight={"Regular"} testID={"discount-condition"}>
            {discount.condition}
          </H4>
          <VSpacer size={16} />
        </>
      )}
      {discount.landingPageUrl && discount.landingPageReferrer && (
        <ButtonOutline
          fullWidth
          label={I18n.t("bonus.cgn.merchantDetail.cta.landingPage")}
          accessibilityLabel={I18n.t(
            "bonus.cgn.merchantDetail.cta.landingPage"
          )}
          onPress={() => {
            mixpanelCgnEvent("CGN_LANDING_PAGE_REQUEST");
            onLandingCtaPress?.(
              discount.landingPageUrl as string,
              discount.landingPageReferrer as string
            );
          }}
        />
      )}
      {discount.discountUrl &&
        merchantType !== DiscountCodeTypeEnum.landingpage && (
          <ButtonOutline
            fullWidth
            label={I18n.t("bonus.cgn.merchantDetail.cta.discountUrl")}
            accessibilityLabel={I18n.t(
              "bonus.cgn.merchantDetail.cta.discountUrl"
            )}
            onPress={() => {
              mixpanelCgnEvent("CGN_DISCOUNT_URL_REQUEST");
              openWebUrl(discount.discountUrl, () =>
                IOToast.error(I18n.t("bonus.cgn.generic.linkError"))
              );
            }}
          />
        )}
      <VSpacer size={16} />
    </View>
  );
};

export const CgnDiscountDetailHeader = ({
  discount
}: Pick<Props, "discount">) => (
  <View style={[IOStyles.row, { alignItems: "center" }, IOStyles.flex]}>
    {discount.discount && (
      <>
        <CgnDiscountValueBox value={discount.discount} small />
        <HSpacer size={16} />
      </>
    )}
    <H3 style={IOStyles.flex} testID={"discount-name"}>
      {discount.name}
    </H3>
  </View>
);
