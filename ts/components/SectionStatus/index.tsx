import {
  ComponentProps,
  RefObject,
  useCallback,
  useEffect,
  useRef
} from "react";

import { View } from "react-native";
import { Alert } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { LevelEnum } from "../../../definitions/content/SectionStatus";
import {
  isSectionVisibleSelector,
  levelForSectionSelector,
  messageForSectionSelector,
  SectionStatusKey,
  webUrlForSectionSelector
} from "../../store/reducers/backendStatus/sectionStatus";
import { getFullLocale } from "../../utils/locale";
import { openWebUrl } from "../../utils/url";
import { useIOSelector } from "../../store/hooks";
import { useIONavigation } from "../../navigation/params/AppParamsList";

type Props = {
  sectionKey: SectionStatusKey;
  onSectionRef?: (ref: RefObject<View | null>) => void;
};

const statusVariantMap: Record<
  LevelEnum,
  ComponentProps<typeof Alert>["variant"]
> = {
  [LevelEnum.normal]: "info",
  [LevelEnum.critical]: "error",
  [LevelEnum.warning]: "warning"
};

const SectionStatusComponent = ({ sectionKey, onSectionRef }: Props) => {
  const viewRef = useRef<View>(null);
  const locale = getFullLocale();

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
    if (!isSectionVisible) {
      return;
    }
    invokeSessionRefCallback();
    navigation?.addListener("focus", invokeSessionRefCallback);
    return () => navigation?.removeListener("focus", invokeSessionRefCallback);
  }, [invokeSessionRefCallback, isSectionVisible, navigation, viewRef]);

  if (!isSectionVisible) {
    return null;
  }

  const action = webUrl ? I18n.t("global.sectionStatus.moreInfo") : undefined;
  const content = `${message}`;
  const variant = statusVariantMap[level ?? LevelEnum.normal];
  const testId = `SectionStatusComponent${webUrl ? "Pressable" : "Content"}`;

  return (
    <Alert
      testID={testId}
      fullWidth
      content={content}
      variant={variant}
      action={action}
      onPress={onPressCallback}
      ref={viewRef}
    />
  );
};

export default SectionStatusComponent;
