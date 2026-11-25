import { LevelEnum } from "@io-app/api-types/generated/definitions/content/SectionStatus";
import { Alert, useIOColors } from "@io-app/design-system";
import I18n from "i18next";
import {
  ComponentProps,
  RefObject,
  useCallback,
  useEffect,
  useRef
} from "react";
import { AccessibilityInfo, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isMixpanelInitializedSelector } from "../../../features/mixpanel/store/selectors";
import { useIONavigation } from "../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../store/hooks";
import {
  isSectionVisibleSelector,
  levelForSectionSelector,
  messageForSectionSelector,
  SectionStatusKey,
  webUrlForSectionSelector
} from "../../../store/reducers/backendStatus/sectionStatus";
import { isMixpanelEnabled as isMixpanelEnabledSelector } from "../../../store/reducers/persistedPreferences";
import { getFullLocale } from "../../../utils/locale";
import { openWebUrl } from "../../../utils/url";

type Props = {
  onSectionRef?: (ref: RefObject<null | View>) => void;
  sectionKey: SectionStatusKey;
  sticky?: boolean;
  trackingAction?: () => void;
};

const statusVariantMap: Record<
  LevelEnum,
  ComponentProps<typeof Alert>["variant"]
> = {
  [LevelEnum.normal]: "info",
  [LevelEnum.critical]: "error",
  [LevelEnum.warning]: "warning"
};

/**
 * This component is a clone of `SectionStatusComponent` but, in addition, when
 * `sticky` prop is `true` it can be anchored to the top of the screen to avoid
 * to push down the content. Another additional feature is that it adds top
 * padding related to `SafeAreaInsets` top value to avoid content from being
 * covered from device status bar.
 */
const ModalSectionStatusComponent = ({
  sectionKey,
  sticky,
  onSectionRef,
  trackingAction
}: Props) => {
  const { top } = useSafeAreaInsets();
  const colors = useIOColors();
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
  const variant = statusVariantMap[level ?? LevelEnum.normal];
  const testId = `ModalSectionStatusComponent${
    webUrl ? "Pressable" : "Content"
  }`;

  return (
    <View
      style={[
        /* Opaque, so a sticky alert hides the content below */
        { backgroundColor: colors.background.default },
        sticky && {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000
        }
      ]}
    >
      {/* The status bar area, on the alert tint */}
      <View style={{ height: top, backgroundColor: colors.surface[variant] }} />
      <Alert
        action={action}
        content={message ?? ""}
        fullWidth
        onPress={onPressCallback}
        ref={viewRef}
        testID={testId}
        variant={variant}
      />
    </View>
  );
};

export default ModalSectionStatusComponent;
