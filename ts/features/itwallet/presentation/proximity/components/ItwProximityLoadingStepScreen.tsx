import { Body, ContentWrapper } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import LoadingScreenContent from "../../../../../components/screens/LoadingScreenContent";
import { ItwProximityMachineContext } from "../machine/provider";
import {
  isInitialLoadingSelector,
  isReminderLoadingSelector
} from "../machine/selectors";

export const ItwProximityLoadingStepScreen = () => {
  const isInitialLoading = ItwProximityMachineContext.useSelector(
    isInitialLoadingSelector
  );

  const isReminderLoading = ItwProximityMachineContext.useSelector(
    isReminderLoadingSelector
  );

  const i18nNs = "features.itWallet.presentation.proximity"; // Common i18n namespace

  const getLoadingStepScreenContentProps = () => {
    if (isInitialLoading) {
      return {
        title: I18n.t(`${i18nNs}.loadingStepScreen.initial.title`),
        subtitle: I18n.t(`${i18nNs}.loadingStepScreen.initial.subtitle`)
      };
    }

    if (isReminderLoading) {
      return {
        title: I18n.t(`${i18nNs}.loadingStepScreen.reminder.title`),
        subtitle: I18n.t(`${i18nNs}.loadingStepScreen.reminder.subtitle`)
      };
    }

    return {
      title: I18n.t(`${i18nNs}.loadingStepScreen.final.title`),
      subtitle: I18n.t(`${i18nNs}.loadingStepScreen.final.subtitle`)
    };
  };

  const { subtitle, title } = getLoadingStepScreenContentProps();

  return (
    <LoadingScreenContent testID="loader" title={title}>
      <ContentWrapper style={{ alignItems: "center" }}>
        <Body style={{ textAlign: "center" }}>{subtitle}</Body>
      </ContentWrapper>
    </LoadingScreenContent>
  );
};
