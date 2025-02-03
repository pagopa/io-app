import {
  Body,
  ButtonOutline,
  H6,
  IOPictograms,
  IOStyles,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import { SafeAreaView, StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import ROUTES from "../../../../navigation/routes";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import themeVariables from "../../../../theme/variables";
import { isFailureSelector } from "../store/selectors";
import { idPayUnsubscribeAction } from "../store/actions";

type ScreenContentType = {
  pictogram: IOPictograms;
  title: string;
  content: string;
  buttonLabel: string;
};

const UnsubscriptionResultScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const isFailure = useIOSelector(isFailureSelector);

  const { pictogram, title, content, buttonLabel }: ScreenContentType =
    isFailure
      ? {
          pictogram: "umbrellaNew",
          title: I18n.t("idpay.unsubscription.failure.title"),
          content: I18n.t("idpay.unsubscription.failure.content"),
          buttonLabel: I18n.t("idpay.unsubscription.failure.button")
        }
      : {
          pictogram: "success",
          title: I18n.t("idpay.unsubscription.success.title"),
          content: I18n.t("idpay.unsubscription.success.content"),
          buttonLabel: I18n.t("idpay.unsubscription.success.button")
        };

  const handleButtonPress = () => {
    dispatch(idPayUnsubscribeAction.cancel());
    if (isFailure) {
      navigation.pop();
    } else {
      navigation.popToTop();
      navigation.navigate(ROUTES.MAIN, {
        screen: ROUTES.WALLET_HOME,
        params: { newMethodAdded: false }
      });
    }
  };

  return (
    <SafeAreaView style={[IOStyles.flex, { flexGrow: 1 }]}>
      <View style={[styles.wrapper, IOStyles.horizontalContentPadding]}>
        <View style={styles.content}>
          <Pictogram name={pictogram} size={80} />
          <VSpacer size={16} />
          <H6>{title}</H6>
          <VSpacer size={16} />
          <Body style={{ textAlign: "center" }}>{content}</Body>
        </View>
        <ButtonOutline
          color="primary"
          label={buttonLabel}
          accessibilityLabel={buttonLabel}
          onPress={handleButtonPress}
          fullWidth={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1
  },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: themeVariables.contentPadding
  }
});

export default UnsubscriptionResultScreen;
