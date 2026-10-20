import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import { HeaderSecondLevel } from "@io-app/design-system";
import I18n from "i18next";
import { RefObject, useCallback, useRef } from "react";

import { useHardwareBackButtonWhenFocused } from "../../../hooks/useHardwareBackButton";
import { useOfflineToastGuard } from "../../../hooks/useOfflineToastGuard";
import { useStartSupportRequest } from "../../../hooks/useStartSupportRequest";
import {
  IOStackNavigationRouteProps,
  useIONavigation
} from "../../../navigation/params/AppParamsList";
import { useOnFirstRender } from "../../../utils/hooks/useOnFirstRender";
import {
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";
import { trackSendAarNotificationClosure } from "../aar/analytics";
import { SendMessageDetailsScreenContent } from "../components/SendMessageDetailsScreenContent";
import { PnParamsList } from "../navigation/params";
import { openingSourceIsAarMessage } from "../utils";

export type MessageDetailsScreenRouteParams = {
  firstTimeOpening: boolean | undefined;
  messageId: string;
  serviceId: ServiceId;
} & (
  | {
      sendOpeningSource: Extract<SendOpeningSource, "aar">;
      sendUserType: Extract<SendUserType, "mandatory" | "recipient">;
    }
  | {
      sendOpeningSource: Extract<SendOpeningSource, "message">;
      sendUserType: Extract<SendUserType, "not_set">;
    }
);

type MessageDetailsRouteProps = IOStackNavigationRouteProps<
  PnParamsList,
  "PN_ROUTES_MESSAGE_DETAILS"
>;

const useCorrectHeader = (
  isAAr: boolean,
  aarBottomSheetRef: RefObject<(() => void) | undefined>,
  userType: SendUserType
) => {
  const { setOptions, goBack } = useIONavigation();
  const startSupportRequest = useOfflineToastGuard(useStartSupportRequest());

  const aarAction: HeaderSecondLevel = {
    title: "",
    type: "singleAction",
    firstAction: {
      icon: "closeLarge",
      onPress: () => {
        trackSendAarNotificationClosure(userType);
        aarBottomSheetRef.current?.();
      },
      accessibilityLabel: I18n.t("global.buttons.close"),
      testID: "AAR_close_button"
    }
  };
  const supportRequestAction: HeaderSecondLevel = {
    type: "singleAction",
    title: "",
    firstAction: {
      icon: "help",
      onPress: startSupportRequest,
      accessibilityLabel: I18n.t(
        "global.accessibility.contextualHelp.open.label"
      ),
      testID: "support_close_button"
    },
    goBack,
    backAccessibilityLabel: I18n.t("global.buttons.back")
  };
  useOnFirstRender(() => {
    setOptions({
      header: () => (
        <HeaderSecondLevel {...(isAAr ? aarAction : supportRequestAction)} />
      ),
      headerShown: true
    });
  });
};

export const MessageDetailsScreen = ({ route }: MessageDetailsRouteProps) => {
  const { sendOpeningSource, sendUserType } = route.params;
  const aarBottomSheetRef = useRef<() => void>(undefined);
  const isAarMessage = openingSourceIsAarMessage(sendOpeningSource);

  const androidBackButtonCallback = useCallback(() => {
    if (isAarMessage) {
      trackSendAarNotificationClosure(sendUserType);
      aarBottomSheetRef.current?.();
      return true;
    }
    return false;
  }, [isAarMessage, sendUserType]);

  useHardwareBackButtonWhenFocused(androidBackButtonCallback);
  useCorrectHeader(isAarMessage, aarBottomSheetRef, sendUserType);

  return (
    <SendMessageDetailsScreenContent
      {...route.params}
      aarBottomSheetRef={isAarMessage ? aarBottomSheetRef : undefined}
    />
  );
};
