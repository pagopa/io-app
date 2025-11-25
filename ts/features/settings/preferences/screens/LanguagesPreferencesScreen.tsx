import {
  Banner,
  RadioGroup,
  RadioItem,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import _ from "lodash";
import {
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Alert, View } from "react-native";
import { Locales } from "../../../../../locales/locales";
import LoadingSpinnerOverlay from "../../../../components/LoadingSpinnerOverlay";
import { AlertModal } from "../../../../components/ui/AlertModal";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { LightModalContext } from "../../../../components/ui/LightModal";
import { availableTranslations } from "../../../../i18n";
import { preferredLanguageSaveSuccess } from "../../../../store/actions/persistedPreferences";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { sectionStatusByKeySelector } from "../../../../store/reducers/backendStatus/sectionStatus";
import { preferredLanguageSelector } from "../../../../store/reducers/persistedPreferences";
import { ContextualHelpPropsMarkdown } from "../../../../utils/help";
import { usePrevious } from "../../../../utils/hooks/usePrevious";
import {
  fromLocaleToPreferredLanguage,
  getFullLocale
} from "../../../../utils/locale";
import { openWebUrl } from "../../../../utils/url";
import { profileUpsert } from "../../common/store/actions";
import { profileSelector } from "../../common/store/selectors";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.language.contextualHelpTitle",
  body: "profile.preferences.language.contextualHelpContent"
};

/**
 * Allows the user to select one of the available Languages as preferred
 */

const LanguagesPreferencesScreen = () => {
  const viewRef = createRef<View>();
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const selectedLanguage = useRef<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const { showModal } = useContext(LightModalContext);
  const profile = useIOSelector(profileSelector, _.isEqual);
  const prevProfile = usePrevious(profile);
  const bannerInfoSelector = useIOSelector(
    sectionStatusByKeySelector("favourite_language")
  );
  const isBannerVisible = bannerInfoSelector && bannerInfoSelector.is_visible;
  const preferredLanguageSelect = useIOSelector(
    preferredLanguageSelector,
    _.isEqual
  );
  const preferredLanguage = useMemo(
    () =>
      pipe(
        preferredLanguageSelect,
        O.getOrElse(() => "it" as Locales)
      ),
    [preferredLanguageSelect]
  );

  const upsertProfile = useCallback(
    (language: Locales) =>
      dispatch(
        profileUpsert.request({
          preferred_languages: [fromLocaleToPreferredLanguage(language)]
        })
      ),
    [dispatch]
  );

  const preferredLanguageSaveSuccessDispatch = useCallback(
    (language: Locales) =>
      dispatch(
        preferredLanguageSaveSuccess({
          preferredLanguage: language
        })
      ),
    [dispatch]
  );

  const renderedItem: Array<RadioItem<string>> = useMemo(
    () =>
      availableTranslations.map(item => ({
        value: I18n.t(`locales.${item}`, {
          defaultValue: item
        }),
        id: item,
        techName: `${item}-${item.toUpperCase()}`
      })),
    []
  );

  const initialSelectedItem = useMemo(
    () => renderedItem.find(item => item.id === preferredLanguage)?.id,
    [preferredLanguage, renderedItem]
  );

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  useEffect(() => {
    // start updating
    if (pot.isUpdating(profile)) {
      setIsLoading(true);
      return;
    }

    // update completed
    if (
      prevProfile &&
      pot.isUpdating(prevProfile) &&
      pot.isSome(profile) &&
      !pot.isError(profile)
    ) {
      setIsLoading(false);
      preferredLanguageSaveSuccessDispatch(selectedLanguage.current as Locales);
      setSelectedItem(selectedLanguage.current);
      showModal(
        <AlertModal
          message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
        />
      );
      toast.success(
        I18n.t(
          "profile.preferences.list.preferred_language.toast.success.title"
        )
      );
      return;
    }

    // update error
    if (
      prevProfile &&
      pot.isSome(prevProfile) &&
      !pot.isError(prevProfile) &&
      pot.isError(profile)
    ) {
      setIsLoading(false);
      toast.error(I18n.t("errors.profileUpdateError"));
    }
  }, [
    selectedLanguage,
    preferredLanguageSaveSuccessDispatch,
    prevProfile,
    profile,
    selectedItem,
    showModal,
    toast
  ]);

  const onLanguageSelected = useCallback(
    (language: string) => {
      if (selectedItem !== language) {
        Alert.alert(
          `${I18n.t(
            "profile.preferences.list.preferred_language.alert.title"
            // eslint-disable-next-line sonarjs/no-nested-template-literals
          )} ${I18n.t(`locales.${language as Locales}`)}?`,
          I18n.t("profile.preferences.list.preferred_language.alert.subtitle"),
          [
            {
              text: I18n.t("global.buttons.cancel"),
              style: "cancel"
            },
            {
              text: I18n.t("global.buttons.confirm"),
              style: "default",
              onPress: () => {
                // eslint-disable-next-line functional/immutable-data
                selectedLanguage.current = language;
                upsertProfile(language as Locales);
              }
            }
          ],
          { cancelable: false }
        );
      }
    },
    [selectedItem, upsertProfile]
  );

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <IOScrollViewWithLargeHeader
        includeContentMargins
        title={{
          label: I18n.t("profile.preferences.list.preferred_language.title")
        }}
        description={I18n.t(
          "profile.preferences.list.preferred_language.subtitle"
        )}
        canGoback={true}
        headerActionsProp={{ showHelp: true }}
        contextualHelpMarkdown={contextualHelpMarkdown}
      >
        <VSpacer size={16} />
        <RadioGroup<string>
          type="radioListItem"
          items={renderedItem}
          selectedItem={selectedItem}
          onPress={onLanguageSelected}
        />
        <VSpacer size={16} />
        {isBannerVisible && (
          <Banner
            ref={viewRef}
            color="neutral"
            content={bannerInfoSelector.message[getFullLocale()]}
            pictogramName="charity"
            action={I18n.t(
              "profile.preferences.list.preferred_language.banner.button"
            )}
            onPress={() =>
              openWebUrl(bannerInfoSelector.web_url?.[getFullLocale()] || "")
            }
          />
        )}
      </IOScrollViewWithLargeHeader>
    </LoadingSpinnerOverlay>
  );
};

export default LanguagesPreferencesScreen;
