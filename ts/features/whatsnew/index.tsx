import { useSelector } from "react-redux";
import I18n from "i18n-js";
import { useIOBottomSheetAutoresizableModal } from "../../utils/hooks/bottomSheet";
import { useIODispatch } from "../../store/hooks";
import { isProfileFirstOnBoardingSelector } from "../../store/reducers/profile";
import { useOnFirstRender } from "../../utils/hooks/useOnFirstRender";
import { isFastLoginEnabledSelector } from "../fastLogin/store/selectors";
import { disableWhatsNew, whatsNewDisplayed } from "./store/actions";
import { FastLoginWhatsNewBody } from "./screen/FastLoginWhatsNew";
import {
  isActiveVersionVisualizedWhatsNewSelector,
  isWhatsNewCheckEnabledSelector,
  isWhatsNewDisplayedSelector
} from "./store/reducers";

// To add a new 'what's new', increase the "ACTIVE_VERSION" constant by 1
// and push a new element into the whatsNewVersions array

export const ACTIVE_VERSION = 0;

export const useWhatsNew = () => {
  const dispatch = useIODispatch();
  const isActiveVersionAlreadyVisualized = useSelector(
    isActiveVersionVisualizedWhatsNewSelector
  );

  const isFirstOnBoarding = useSelector(isProfileFirstOnBoardingSelector);
  // This prevents the function displaying whatsnew from being executed again, in case of a rerender.
  const isVisualized = useSelector(isWhatsNewDisplayedSelector);

  const isFastLoginEnabled = useSelector(isFastLoginEnabledSelector);

  const isWhatsNewCheckEnabled = useSelector(isWhatsNewCheckEnabledSelector);

  const {
    present: presentWhatsNewBottomSheet,
    bottomSheet: autoResizableBottomSheet
  } = useIOBottomSheetAutoresizableModal({
    title: whatsNewVersions[ACTIVE_VERSION].title,
    component: whatsNewVersions[ACTIVE_VERSION].body,
    onDismiss: () => {
      dispatch(
        disableWhatsNew({
          whatsNewVersion: ACTIVE_VERSION
        })
      );
    }
  });

  // WhatsNew is shown during accepting tos (old user) and on app launch (messages) when a new version is created
  // If this is the first onboarding, we don't want to show it in any case, so we set it as already displayed.
  // If we based its showing on isFirstOnBoarding, at the end of the onboarding, once you get to messages, it'd be shown
  useOnFirstRender(() => {
    // Since during first onbaording two screens using this hook are mounted,
    // isActiveVersionAlreadyVisualized prevents the action from being dispatched twice
    if (
      isFastLoginEnabled &&
      isFirstOnBoarding &&
      !isActiveVersionAlreadyVisualized
    ) {
      dispatch(
        disableWhatsNew({
          whatsNewVersion: ACTIVE_VERSION
        })
      );
    }
  });

  // Since the message component is rendered together with onboarding (or tos), it sometimes executes this function
  // before landing on MessagesHome.
  // isWhatsNewCheckEnabled prevents the function from running
  const checkToShowWhatsNew = (skipCheck: boolean = false) => {
    if (skipCheck || isWhatsNewCheckEnabled) {
      showWhatsNew();
    }
  };

  const showWhatsNew = () => {
    if (
      isFastLoginEnabled &&
      !isActiveVersionAlreadyVisualized &&
      !isVisualized
    ) {
      presentWhatsNewBottomSheet();
      dispatch(whatsNewDisplayed());
    }
  };

  return { checkToShowWhatsNew, autoResizableBottomSheet };
};

type WhatsNew = {
  version: number;
  title: string;
  body: JSX.Element;
};

const whatsNewVersions: Array<WhatsNew> = [];

// eslint-disable-next-line functional/immutable-data
whatsNewVersions.push({
  version: 0,
  title: I18n.t("fastLogin.whatsNew.title"),
  body: FastLoginWhatsNewBody
});
