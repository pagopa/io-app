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
import { WithTestID } from "../../../types/WithTestID";

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

  type MessageAction<T extends string> = {
    label: T;
    accessibilityLabel: T;
    onPress: () => void;
  };

  type Messages = {
    [key: number]: {
      pictogram: IOPictograms;
      title: string;
      subtitle: string;
      action: MessageAction<string>;
      secondaryAction: MessageAction<string>;
    };
  };

  const createMessageAction = React.useCallback(
    <T extends string>({
      label,
      onPress
    }: {
      label: T;
      onPress: () => void;
    }): WithTestID<MessageAction<T>> => ({
      label,
      accessibilityLabel: label,
      onPress,
      testID: `message-action-${label}`
    }),
    []
  );

  const messages: Messages = React.useMemo(
    () => ({
      2: {
        pictogram: "attention",
        title: "Il PIN non è corretto",
        subtitle: "Hai ancora 2 tentativi, controllalo e riprova.",
        action: createMessageAction({
          label: I18n.t("global.buttons.retry"),
          onPress: navigateToCiePinScreen
        }),
        secondaryAction: createMessageAction({
          label: I18n.t("global.buttons.close"),
          onPress: navigateToAuthenticationScreen
        })
      },
      1: {
        pictogram: "attention",
        title: "Hai inserito un PIN errato per 2 volte",
        subtitle:
          "Al terzo tentativo errato, il PIN verrà bloccato. Per sbloccarlo e impostarne un nuovo, dovrai inserire il codice PUK nell’app CieID.",
        action: createMessageAction({
          label: I18n.t("global.buttons.retry"),
          onPress: navigateToCiePinScreen
        }),
        secondaryAction: createMessageAction({
          label: "Hai dimenticato il PIN?",
          onPress: didYouForgetPin
        })
      },
      0: {
        pictogram: "fatalError",
        title: "Hai inserito un PIN errato per troppe volte",
        subtitle:
          "Il PIN della tua CIE è stato bloccato. Per sbloccarlo e impostarne un nuovo, dovrai inserire il codice PUK nell’app CieID.",
        action: createMessageAction({
          label: I18n.t("global.buttons.close"),
          onPress: navigateToAuthenticationScreen
        }),
        secondaryAction: createMessageAction({
          label: "Hai dimenticato il PUK?",
          onPress: didYouForgetPuk
        })
      }
    }),
    [
      createMessageAction,
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
      action: createMessageAction({
        label: I18n.t("global.buttons.retry"),
        onPress: navigateToCiePinScreen
      }),
      secondaryAction: createMessageAction({
        label: I18n.t("global.buttons.close"),
        onPress: navigateToAuthenticationScreen
      })
    }),
    [
      createMessageAction,
      navigateToAuthenticationScreen,
      navigateToCiePinScreen
    ]
  );

  const getMessage = React.useCallback(
    (key: number) => (key in messages ? messages[key] : defaultMessage),
    [defaultMessage, messages]
  );

  const { pictogram, title, subtitle, action, secondaryAction } =
    getMessage(remainingCount);

  return (
    <OperationResultScreenContent
      pictogram={pictogram}
      title={title}
      subtitle={subtitle}
      action={action}
      secondaryAction={secondaryAction}
    />
  );
};

export default CieWrongCiePinScreen;
