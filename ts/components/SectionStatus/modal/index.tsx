import {
  ComponentProps,
  RefObject,
  useCallback,
  useEffect,
  useRef
} from "react";

import { AccessibilityInfo, View } from "react-native";
import { Alert, IOColors } from "@pagopa/io-app-design-system";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import I18n from "i18next";
import { LevelEnum } from "../../../../definitions/content/SectionStatus";
import {
  isSectionVisibleSelector,
  levelForSectionSelector,
  messageForSectionSelector,
  SectionStatusKey,
  webUrlForSectionSelector
} from "../../../store/reducers/backendStatus/sectionStatus";
import { getFullLocale } from "../../../utils/locale";
import { openWebUrl } from "../../../utils/url";
import { useIOSelector } from "../../../store/hooks";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { isMixpanelInitializedSelector } from "../../../features/mixpanel/store/selectors";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../store/reducers/persistedPreferences";

type Props = {
  sectionKey: SectionStatusKey;
  onSectionRef?: (ref: RefObject<View | null>) => void;
  trackingAction?: () => void;
  sticky?: boolean;
};

const statusVariantMap: Record<
  LevelEnum,
  {
    variant: ComponentProps<typeof Alert>["variant"];
    background: IOColors;
  }
> = {
  [LevelEnum.normal]: {
    variant: "info",
    background: "info-100"
  },
  [LevelEnum.critical]: { variant: "error", background: "error-100" },
  [LevelEnum.warning]: { variant: "warning", background: "warning-100" }
};

/**
 * This component is a clone of `SectionStatusComponent` but, in addition,
 * when `sticky` prop is `true` it can be anchored to the top of the screen to avoid to push down the content.
 * Another additional feature is that it adds top padding related to `SafeAreaInsets` top value
 * to avoid content from being covered from device status bar.
 */
const ModalSectionStatusComponent = ({
  sectionKey,
  sticky,
  onSectionRef,
  trackingAction
}: Props) => {
  const { top } = useSafeAreaInsets();
  const viewRef = useRef<View>(null);
  const locale = getFullLocale();
  const isMixpanelInitialized = useIOSelector(isMixpanelInitializedSelector);
  const isMixpanelEnabled = useIOSelector(isMixpanelEnabledSelector);

  const navigation = useIONavigation();
  const isSectionVisible = useIOSelector(state =>
    isSectionVisibleSelector(state, sectionKey)
  );
  const webUrl = useIOSelector(state =>
    webUrlForSectionSelector(state, sectionKey, locale)
  );
  const message = useIOSelector(state =>
    messageForSectionSelector(state, sectionKey, locale)
  );
  const level = useIOSelector(state =>
    levelForSectionSelector(state, sectionKey)
  );

  const onPressCallback = useCallback(() => {
    if (webUrl) {
      openWebUrl(webUrl);
    }
  }, [webUrl]);
  const invokeSessionRefCallback = useCallback(() => {
    if (viewRef.current) {
      onSectionRef?.(viewRef);
    }
  }, [onSectionRef, viewRef]);

  useEffect(() => {
    if (
      isSectionVisible &&
      isMixpanelInitialized &&
      isMixpanelEnabled !== false
    ) {
      trackingAction?.();
    }
  }, [
    isSectionVisible,
    isMixpanelInitialized,
    isMixpanelEnabled,
    trackingAction
  ]);

  useEffect(() => {
    if (!isSectionVisible) {
      return;
    }
    invokeSessionRefCallback();
    navigation?.addListener("focus", invokeSessionRefCallback);
    return () => navigation?.removeListener("focus", invokeSessionRefCallback);
  }, [invokeSessionRefCallback, isSectionVisible, navigation, viewRef]);

  useEffect(() => {
    if (isSectionVisible && message) {
      AccessibilityInfo.announceForAccessibilityWithOptions(message, {
        queue: true
      });
    }
  }, [isSectionVisible, message]);

  if (!isSectionVisible) {
    return null;
  }

  const action = webUrl ? I18n.t("global.sectionStatus.moreInfo") : undefined;
  const { variant, background } = statusVariantMap[level ?? LevelEnum.normal];
  const testId = `ModalSectionStatusComponent${
    webUrl ? "Pressable" : "Content"
  }`;

  return (
    <View
      style={[
        {
          backgroundColor: IOColors[background],
          paddingTop: top
        },
        sticky && {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }
      ]}
    >
      <Alert
        testID={testId}
        fullWidth
        content={message ?? ""}
        variant={variant}
        action={action}
        onPress={onPressCallback}
        ref={viewRef}
      />
    </View>
  );
};

export default ModalSectionStatusComponent;
