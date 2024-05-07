/**
 * A screen to alert the user about the number of attempts remains
 */
import * as React from "react";
import { Route, useRoute } from "@react-navigation/native";
import { IOPictograms } from "@pagopa/io-app-design-system";
import { Linking } from "react-native";
import { constNull } from "fp-ts/lib/function";
import I18n from "../../../i18n";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import ROUTES from "../../../navigation/routes";
import { OperationResultScreenContent } from "../../../components/screens/OperationResultScreenContent";

export type CieWrongCiePinScreenNavigationParams = {
  remainingCount: number;
};

const CieWrongCiePinScreen = () => {
  const navigation = useIONavigation();
  const route =
    useRoute<
      Route<
        typeof ROUTES.CIE_WRONG_PIN_SCREEN,
        CieWrongCiePinScreenNavigationParams
      >
    >();
  const { remainingCount } = route.params;

  const navigateToCiePinScreen = React.useCallback(() => {
    navigation.navigate(ROUTES.AUTHENTICATION, {
      screen: ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

  const navigateToAuthenticationScreen = React.useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: ROUTES.AUTHENTICATION }]
    });
  }, [navigation]);

  const didYouForgetPin = React.useCallback(() => {
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/"
    ).catch(constNull);
  }, []);

  const didYouForgetPuk = React.useCallback(() => {
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/recupero-puk/"
    ).catch(constNull);
  }, []);

  type Messages = {
    [key: number]: {
      pictogram: IOPictograms;
      title: string;
      subtitle: string;
      actionLabel: string;
      actionHandler: () => void;
      secondaryActionLabel: string;
      secondaryActionHandler: () => void;
    };
  };
  const messages: Messages = React.useMemo(
    () => ({
      2: {
        pictogram: "attention",
        title: "Il PIN non è corretto",
        subtitle: "Hai ancora 2 tentativi, controllalo e riprova.",
        actionLabel: I18n.t("global.buttons.retry"),
        actionHandler: navigateToCiePinScreen,
        secondaryActionLabel: I18n.t("global.buttons.close"),
        secondaryActionHandler: navigateToAuthenticationScreen
      },
      1: {
        pictogram: "attention",
        title: "Hai inserito un PIN errato per 2 volte",
        subtitle:
          "Al terzo tentativo errato, il PIN verrà bloccato. Per sbloccarlo e impostarne un nuovo, dovrai inserire il codice PUK nell’app CieID.",
        actionLabel: I18n.t("global.buttons.retry"),
        actionHandler: navigateToCiePinScreen,
        secondaryActionLabel: "Hai dimenticato il PIN?",
        secondaryActionHandler: didYouForgetPin
      },
      0: {
        pictogram: "fatalError",
        title: "Hai inserito un PIN errato per troppe volte",
        subtitle:
          "Il PIN della tua CIE è stato bloccato. Per sbloccarlo e impostarne un nuovo, dovrai inserire il codice PUK nell’app CieID.",
        actionLabel: I18n.t("global.buttons.close"),
        actionHandler: navigateToAuthenticationScreen,
        secondaryActionLabel: "Hai dimenticato il PUK?",
        secondaryActionHandler: didYouForgetPuk
      }
    }),
    [
      didYouForgetPin,
      didYouForgetPuk,
      navigateToAuthenticationScreen,
      navigateToCiePinScreen
    ]
  );

  const defaultMessage: (typeof messages)[0] = React.useMemo(
    () => ({
      pictogram: "attention",
      title: "Il PIN non è corretto",
      subtitle: "Controllalo e riprova.",
      actionLabel: I18n.t("global.buttons.retry"),
      actionHandler: navigateToCiePinScreen,
      secondaryActionLabel: I18n.t("global.buttons.close"),
      secondaryActionHandler: navigateToAuthenticationScreen
    }),
    [navigateToAuthenticationScreen, navigateToCiePinScreen]
  );

  const getMessage = React.useCallback(
    (key: number) => messages[key] || defaultMessage,
    [defaultMessage, messages]
  );

  const {
    pictogram,
    actionLabel,
    actionHandler,
    secondaryActionLabel,
    secondaryActionHandler,
    title,
    subtitle
  } = getMessage(remainingCount);

  return (
    <OperationResultScreenContent
      pictogram={pictogram}
      title={title}
      subtitle={subtitle}
      action={{
        label: actionLabel,
        accessibilityLabel: actionLabel,
        onPress: actionHandler
      }}
      secondaryAction={{
        label: secondaryActionLabel,
        accessibilityLabel: secondaryActionLabel,
        onPress: secondaryActionHandler
      }}
    />
  );
};

export default CieWrongCiePinScreen;
