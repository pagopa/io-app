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

  type Message = {
    pictogram: IOPictograms;
    title: string;
    subtitle: string;
    action: MessageAction<string>;
    secondaryAction: MessageAction<string>;
  };

  type Messages = {
    [key: number]: Message;
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
        title: I18n.t("authentication.cie.pin.incorrectCiePinTitle1"),
        subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent1"),
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
        title: I18n.t("authentication.cie.pin.incorrectCiePinTitle2"),
        subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent2"),
        action: createMessageAction({
          label: I18n.t("global.buttons.retry"),
          onPress: navigateToCiePinScreen
        }),
        secondaryAction: createMessageAction({
          label: I18n.t(
            "authentication.cie.pin.incorrectCiePinSecondaryActionLabel2"
          ),
          onPress: didYouForgetPin
        })
      },
      0: {
        pictogram: "fatalError",
        title: I18n.t("authentication.cie.pin.lockedCiePinTitle"),
        subtitle: I18n.t("authentication.cie.pin.lockedCiePinContent"),
        action: createMessageAction({
          label: I18n.t("global.buttons.close"),
          onPress: navigateToAuthenticationScreen
        }),
        secondaryAction: createMessageAction({
          label: I18n.t("authentication.cie.pin.lockedSecondaryActionLabel"),
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

  // This should never happen,
  // but it's a good practice to have a default message
  // in case of unexpected values of `remainingCount`.
  const defaultMessageThatShouldNeverHappen: Message = React.useMemo(
    () => ({
      pictogram: "attention",
      title: I18n.t("global.genericError"),
      subtitle: `${remainingCount}`,
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
      navigateToCiePinScreen,
      remainingCount
    ]
  );

  const getMessage = React.useCallback(
    (key: number) =>
      key in messages ? messages[key] : defaultMessageThatShouldNeverHappen,
    [defaultMessageThatShouldNeverHappen, messages]
  );

  return <OperationResultScreenContent {...getMessage(remainingCount)} />;
};

export default CieWrongCiePinScreen;
