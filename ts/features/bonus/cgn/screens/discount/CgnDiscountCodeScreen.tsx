import {
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

  if (discountCode) {
    return (
      <>
        <IOScrollView
          headerConfig={{
            title: "Ecco il tuo codice",
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
            Ecco il codice sconto!
          </H2>
          <VSpacer size={24} />
          <View style={styles.discountCodeContainer}>
            <View style={[IOStyles.row, { alignSelf: "center" }]}>
              <Icon name="tag" color="grey-300" />
            </View>
            <VSpacer size={4} />
            <H1 style={styles.labelCode}>{discountCode}</H1>
            {isReady(discountOtp) && (
              <>
                <VSpacer size={32} />
                <CgnDiscountExpireProgressBar
                  secondsExpirationTotal={discountOtp.value.ttl}
                  secondsToExpiration={discountOtp.value.ttl}
                  setIsExpired={setIsDiscountCodeExpired}
                />
              </>
            )}
          </View>
          {/* </GradientScrollView> */}
        </IOScrollView>
        <FooterActions
          actions={{
            type: "SingleButton",
            primary: {
              label: "Copia codice sconto",
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
  labelCode: { alignSelf: "center", textAlign: "center" }
});

export default CgnDiscountCodeScreen;
