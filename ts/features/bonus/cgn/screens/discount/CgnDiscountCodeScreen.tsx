import { Second } from "@pagopa/ts-commons/lib/units";
import {
  Body,
  H1,
  H2,
  Icon,
  IOColors,
  IOStyles,
  useIOTheme,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { useIOSelector } from "../../../../../store/hooks";
import { cgnSelectedDiscountCodeSelector } from "../../store/reducers/merchants";
import I18n from "../../../../../i18n";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { IOScrollView } from "../../../../../components/ui/IOScrollView";
import { FooterActions } from "../../../../../components/ui/FooterActions";
import { clipboardSetStringWithFeedback } from "../../../../../utils/clipboard";
import { CgnDiscountExpireProgressBar } from "../../components/merchants/discount/CgnDiscountExpireProgressBar";
import { cgnOtpDataSelector } from "../../store/reducers/otp";
import { isReady } from "../../../../../common/model/RemoteValue";
import { Otp } from "../../../../../../definitions/cgn/Otp";

const getOtpTTL = (otp: Otp): Second => {
  const now = new Date();
  const expiration = (otp.expires_at.getTime() - now.getTime()) / 1000;
  if (expiration > 0) {
    // take the min between ttl and computed seconds
    return (
      otp.ttl ? Math.min(Math.ceil(expiration), otp.ttl) : expiration
    ) as Second;
  }
  // expires is in the past relative to the dice current time, use ttl as fallback
  return otp.ttl as Second;
};

const getOtpExpirationTotal = (otp: Otp): Second =>
  Math.floor(
    (otp.expires_at.getTime() - new Date().getTime()) / 1000
  ) as Second;

const CgnDiscountCodeScreen = () => {
  const discountCode = useIOSelector(cgnSelectedDiscountCodeSelector);
  const discountOtp = useIOSelector(cgnOtpDataSelector);
  const [isDiscountCodeExpired, setIsDiscountCodeExpired] =
    React.useState(false);

  const navigation = useIONavigation();
  const theme = useIOTheme();

  const onClose = () => {
    navigation.pop();
  };

  const handleOnPressCopy = () => {
    if (!discountCode) {
      return;
    }
    clipboardSetStringWithFeedback(discountCode);
  };

  React.useEffect(() => {
    if (isReady(discountOtp)) {
      setIsDiscountCodeExpired(getOtpExpirationTotal(discountOtp.value) <= 0);
    }
  }, [discountOtp]);

  if (discountCode) {
    return (
      <>
        <IOScrollView
          headerConfig={{
            title: I18n.t(`bonus.cgn.merchantDetail.discount.title`),
            isModal: true,
            type: "singleAction",
            firstAction: {
              icon: "closeLarge",
              accessibilityLabel: I18n.t("global.buttons.close"),
              onPress: onClose
            }
          }}
        >
          <H2 color={theme["textHeading-default"]} accessibilityRole="header">
            {I18n.t(`bonus.cgn.merchantDetail.discount.title`)}
          </H2>
          <VSpacer size={24} />
          <View style={styles.discountCodeContainer}>
            <View style={[IOStyles.row, { alignSelf: "center" }]}>
              <Icon name="tag" color="grey-300" />
            </View>
            <VSpacer size={4} />
            <H1
              style={[
                styles.labelCode,
                isDiscountCodeExpired ? styles.codeExpired : undefined
              ]}
            >
              {discountCode}
            </H1>
            {isReady(discountOtp) && !isDiscountCodeExpired && (
              <>
                <VSpacer size={16} />
                <CgnDiscountExpireProgressBar
                  secondsExpirationTotal={getOtpExpirationTotal(
                    discountOtp.value
                  )}
                  secondsToExpiration={getOtpTTL(discountOtp.value)}
                  setIsExpired={setIsDiscountCodeExpired}
                />
              </>
            )}
            {isDiscountCodeExpired && (
              <Body style={IOStyles.selfCenter}>
                {I18n.t(`bonus.cgn.merchantDetail.discount.expired`)}
              </Body>
            )}
          </View>
        </IOScrollView>
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: I18n.t(`bonus.cgn.merchantDetail.discount.copyButton`),
              disabled: isDiscountCodeExpired,
              onPress: handleOnPressCopy
            }
          }}
        />
      </>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  discountCodeContainer: {
    borderColor: IOColors["grey-100"],
    borderWidth: 1,
    padding: 16,
    borderRadius: 8
  },
  labelCode: {
    alignSelf: "center",
    textAlign: "center"
  },
  codeExpired: {
    textDecorationLine: "line-through"
  }
});

export default CgnDiscountCodeScreen;
