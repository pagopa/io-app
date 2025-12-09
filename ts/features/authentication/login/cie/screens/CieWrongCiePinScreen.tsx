/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback, useMemo } from "react";
import { Route, useRoute } from "@react-navigation/native";
import { IOPictograms } from "@pagopa/io-app-design-system";
import { Linking } from "react-native";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { useIONavigation } from "../../../../../navigation/params/AppParamsList";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { WithTestID } from "../../../../../types/WithTestID";
import { AUTHENTICATION_ROUTES } from "../../../common/navigation/routes";
import useActiveSessionLoginNavigation from "../../../activeSessionLogin/utils/useActiveSessionLoginNavigation";

export type CieWrongCiePinScreenNavigationParams = {
  remainingCount: number;
};

const CieWrongCiePinScreen = () => {
  const navigation = useIONavigation();
  const route =
    useRoute<
      Route<
        typeof AUTHENTICATION_ROUTES.CIE_WRONG_PIN_SCREEN,
        CieWrongCiePinScreenNavigationParams
      >
    >();
  const { remainingCount } = route.params;

  const { navigateToAuthenticationScreen } = useActiveSessionLoginNavigation();

  const navigateToCiePinScreen = useCallback(() => {
    navigation.navigate(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_PIN_SCREEN
    });
  }, [navigation]);

  const didYouForgetPin = useCallback(() => {
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/"
    ).catch(constNull);
  }, []);

  const didYouForgetPuk = useCallback(() => {
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

  const createMessageAction = useCallback(
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

  const messages: Messages = useMemo(
    () => ({
      2: {
        enableAnimatedPictogram: true,
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
        enableAnimatedPictogram: true,
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
        enableAnimatedPictogram: true,
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
  const defaultMessageThatShouldNeverHappen: Message = useMemo(
    () => ({
      enableAnimatedPictogram: true,
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

  const getMessage = (key: number) =>
    key in messages ? messages[key] : defaultMessageThatShouldNeverHappen;

  return <OperationResultScreenContent {...getMessage(remainingCount)} />;
};

export default CieWrongCiePinScreen;
