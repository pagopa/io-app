import React from "react";
import { IOColors } from "@pagopa/io-app-design-system";
import { openWebUrl } from "../../../../utils/url";
import I18n from "../../../../i18n";
import { AlertProps } from "../../../../hooks/useHeaderSecondLevel";
import {
  LevelEnum,
  SectionStatus
} from "../../../../../definitions/content/SectionStatus";
import { getFullLocale } from "../../../../utils/locale";
import FocusAwareStatusBar from "../../../../components/ui/FocusAwareStatusBar";

const mapSectionStatusToAlertProps = (
  sectionStatus: SectionStatus
): AlertProps => {
  const locale = getFullLocale();
  return {
    variant: mapLevelToVariant(sectionStatus.level),
    content:
      sectionStatus.message[locale as keyof typeof sectionStatus.message] ||
      sectionStatus.message["it-IT"],
    action: I18n.t("global.sectionStatus.moreInfo"),
    onPress: () => {
      if (sectionStatus.web_url) {
        openWebUrl(sectionStatus.web_url[locale]);
      }
    }
  };
};

const mapLevelToVariant = (level: LevelEnum): AlertProps["variant"] => {
  switch (level) {
    case LevelEnum.critical:
      return "error";
    case LevelEnum.warning:
      return "warning";
    default:
      return "info";
  }
};

const mapLevelToColor = (level: LevelEnum): string => {
  switch (level) {
    case LevelEnum.critical:
      return IOColors["error-100"];
    case LevelEnum.warning:
      return IOColors["warning-100"];
    default:
      return IOColors["info-100"];
  }
};

/**
 * Hook that takes a SectionStatus and maps it to create alert properties.
 * Also configures a FocusAwareStatusBar based on the alert level.
 * @param sectionStatus - The section status can be undefined.
 * @returns An object containing the alert properties and the configured status bar.
 */
export const useItwAlertWithStatusBar = (sectionStatus?: SectionStatus) => {
  if (!sectionStatus || !sectionStatus.is_visible) {
    return {
      alertProps: undefined,
      statusBar: null
    };
  }

  const alertProps = mapSectionStatusToAlertProps(sectionStatus);
  const statusBarColor = mapLevelToColor(sectionStatus.level);

  return {
    alertProps,
    statusBar: (
      <FocusAwareStatusBar
        backgroundColor={statusBarColor}
        barStyle="dark-content"
      />
    )
  };
};
