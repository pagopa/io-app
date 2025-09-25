/**
 * A screen to alert the user about the number of attempts remains
 */
import { useCallback, useMemo } from "react";
import { Route, useRoute } from "@react-navigation/native";
import { IOPictograms } from "@pagopa/io-app-design-system";
import { Linking } from "react-native";
import { constNull } from "fp-ts/lib/function";
import I18n from "i18next";
import { ITW_ROUTES } from "../../../navigation/routes";
import { OperationResultScreenContent } from "../../../../../components/screens/OperationResultScreenContent";
import { WithTestID } from "../../../../../types/WithTestID";
import { ItwEidIssuanceMachineContext } from "../../../machine/eid/provider";
import { useItwPreventNavigationEvent } from "../../../common/hooks/useItwPreventNavigationEvent";
import {
  trackItWalletCiePinForgotten,
  trackItWalletCiePukForgotten,
  trackItWalletCieRetryPin,
  trackItWalletErrorPin,
  trackItWalletLastErrorPin,
  trackItWalletSecondErrorPin
} from "../../../analytics";
import { isL3FeaturesEnabledSelector } from "../../../machine/eid/selectors";
import { ItwCieMachineContext } from "../machine/provider";
import { selectReadProgress } from "../machine/selectors";

export type ItwCieWrongCiePinScreenNavigationParams = {
  remainingCount: number;
};

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

export const ItwCieWrongCiePinScreen = () => {
  const machineRef = ItwEidIssuanceMachineContext.useActorRef();
  const isL3Enabled = ItwEidIssuanceMachineContext.useSelector(
    isL3FeaturesEnabledSelector
  );
  const itw_flow = isL3Enabled ? "L3" : "L2";
  const readProgress = ItwCieMachineContext.useSelector(selectReadProgress);

  useItwPreventNavigationEvent();

  const route =
    useRoute<
      Route<
        typeof ITW_ROUTES.IDENTIFICATION.CIE.WRONG_PIN,
        ItwCieWrongCiePinScreenNavigationParams
      >
    >();
  const { remainingCount } = route.params;

  const handleTrackPinErrors = useCallback(
    (key: number) => {
      switch (key) {
        case 2:
          trackItWalletErrorPin(itw_flow, readProgress ?? 0);
          break;
        case 1:
          trackItWalletSecondErrorPin(itw_flow, readProgress ?? 0);
          break;
        case 0:
          trackItWalletLastErrorPin(itw_flow, readProgress ?? 0);
          break;
      }
    },
    [itw_flow, readProgress]
  );

  const handleRetry = useCallback(() => {
    trackItWalletCieRetryPin(itw_flow);
    machineRef.send({ type: "back" });
  }, [machineRef, itw_flow]);

  const handleClose = useCallback(() => {
    machineRef.send({ type: "close" });
  }, [machineRef]);

  const didYouForgetPin = useCallback(() => {
    trackItWalletCiePinForgotten(itw_flow);
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/codici-di-sicurezza-pin-e-puk/"
    ).catch(constNull);
  }, [itw_flow]);

  const didYouForgetPuk = useCallback(() => {
    trackItWalletCiePukForgotten(itw_flow);
    Linking.openURL(
      "https://www.cartaidentita.interno.gov.it/info-utili/recupero-puk/"
    ).catch(constNull);
  }, [itw_flow]);

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
        pictogram: "attention",
        title: I18n.t("authentication.cie.pin.incorrectCiePinTitle1"),
        subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent1"),
        action: createMessageAction({
          label: I18n.t("global.buttons.retry"),
          onPress: handleRetry
        }),
        secondaryAction: createMessageAction({
          label: I18n.t("global.buttons.close"),
          onPress: handleClose
        })
      },
      1: {
        pictogram: "attention",
        title: I18n.t("authentication.cie.pin.incorrectCiePinTitle2"),
        subtitle: I18n.t("authentication.cie.pin.incorrectCiePinContent2"),
        action: createMessageAction({
          label: I18n.t("global.buttons.retry"),
          onPress: handleRetry
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
          onPress: handleClose
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
      handleClose,
      handleRetry
    ]
  );

  // This should never happen,
  // but it's a good practice to have a default message
  // in case of unexpected values of `remainingCount`.
  const defaultMessageThatShouldNeverHappen: Message = useMemo(
    () => ({
      pictogram: "attention",
      title: I18n.t("global.genericError"),
      subtitle: `${remainingCount}`,
      action: createMessageAction({
        label: I18n.t("global.buttons.retry"),
        onPress: handleRetry
      }),
      secondaryAction: createMessageAction({
        label: I18n.t("global.buttons.close"),
        onPress: handleClose
      })
    }),
    [createMessageAction, handleClose, handleRetry, remainingCount]
  );

  const getMessage = useCallback(
    (key: number) => {
      handleTrackPinErrors(key);
      return key in messages
        ? messages[key]
        : defaultMessageThatShouldNeverHappen;
    },
    [defaultMessageThatShouldNeverHappen, messages, handleTrackPinErrors]
  );

  return <OperationResultScreenContent {...getMessage(remainingCount)} />;
};
