import {
  BodySmall,
  ListItemHeader,
  RadioGroup,
  RadioItem,
  useIOToast,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import {
  availableTranslations,
  Locales,
  localeToPreferredLanguageMapping,
  setLocale
} from "../../../../i18n";
import { preferredLanguageSaveSuccess } from "../../../../store/actions/persistedPreferences";

import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { preferredLanguageSelector } from "../../../../store/reducers/persistedPreferences";
import { ContextualHelpPropsMarkdown } from "../../../../utils/contextualHelp";
import { usePrevious } from "../../../../utils/hooks/usePrevious";
import {
  fromLocaleToPreferredLanguage,
  fromPreferredLanguageToLocale
} from "../../../../utils/locale";
import { profileUpsert } from "../../common/store/actions";
import { profileSelector } from "../../common/store/selectors";

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.language.contextualHelpTitle",
  body: "profile.preferences.language.contextualHelpContent"
};

/**
 * Allows the user to select one of the available Languages as preferred
 */

type AppLocaleId = `app-locale-${Locales}`;

const LanguagesPreferencesScreen = () => {
  const dispatch = useIODispatch();
  const toast = useIOToast();
  const previousSelectedItem = useRef<string | undefined>(undefined);
  const profile = useIOSelector(profileSelector, _.isEqual);
  const prevProfile = usePrevious(profile);
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
      availableTranslations
        .filter(item => localeToPreferredLanguageMapping.has(item))
        .map(item => ({
          value: I18n.t(`localesTranslated.${item}`, {
            defaultValue: item
          }),
          id: item,
          techName: `${item}-${item.toUpperCase()}`
        })),
    []
  );

  const initialSelectedItem = useMemo(
    () =>
      renderedItem.find(
        item =>
          pot.isSome(profile) &&
          profile.value.preferred_languages &&
          item.id ===
            fromPreferredLanguageToLocale(profile.value?.preferred_languages[0])
      )?.id,
    [profile, renderedItem]
  );

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  /* IT, EN pinned first, then all available translations
     sorted alphabetically */
  const appLocaleOptions: Array<RadioItem<AppLocaleId>> = useMemo(
    () =>
      [
        ...new Set<Locales>([
          "it",
          "en",
          ...[...availableTranslations].sort((a, b) => a.localeCompare(b))
        ])
      ].map(locale => ({
        value: I18n.t(`localesTranslated.${locale}`, {
          defaultValue: locale
        }),
        id: `app-locale-${locale}`
      })),
    []
  );

  const initialAppSelectedItem = useMemo(
    () =>
      appLocaleOptions.find(
        item => item.id === `app-locale-${preferredLanguage}`
      )?.id,
    [preferredLanguage, appLocaleOptions]
  );

  const [selectedAppLocale, setSelectedAppLocale] = useState<AppLocaleId>(
    initialAppSelectedItem ?? `app-locale-${preferredLanguage}`
  );

  const handleAppLocaleChange = useCallback(
    (localeId: AppLocaleId) => {
      const locale = localeId.replace("app-locale-", "") as Locales;

      setLocale(locale);
      preferredLanguageSaveSuccessDispatch(locale);
      setSelectedAppLocale(localeId);
      toast.success(
        I18n.t(
          "profile.preferences.list.preferred_language.toastApp.success.title"
        )
      );
    },
    [preferredLanguageSaveSuccessDispatch, toast]
  );

  useEffect(() => {
    // update completed
    if (
      prevProfile &&
      pot.isUpdating(prevProfile) &&
      pot.isSome(profile) &&
      !pot.isError(profile)
    ) {
      toast.success(
        I18n.t(
          "profile.preferences.list.preferred_language.toastMessages.success.title"
        )
      );
      return;
    }

    // update error: revert to previous selection
    if (
      prevProfile &&
      pot.isSome(prevProfile) &&
      !pot.isError(prevProfile) &&
      pot.isError(profile)
    ) {
      setSelectedItem(previousSelectedItem.current);
      toast.error(I18n.t("global.genericError"));
    }
  }, [prevProfile, profile, toast]);

  const onLanguageSelected = useCallback(
    (language: string) => {
      if (selectedItem !== language) {
        // eslint-disable-next-line functional/immutable-data
        previousSelectedItem.current = selectedItem;
        setSelectedItem(language);
        upsertProfile(language as Locales);
      }
    },
    [selectedItem, upsertProfile]
  );

  const onAppLanguageSelected = useCallback(
    (language: string) => {
      if (selectedAppLocale !== language) {
        const locale = language.replace("app-locale-", "") as Locales;
        Alert.alert(
          I18n.t("profile.preferences.list.preferred_language.alert.title", {
            lang: I18n.t(`locales.${locale}`)
          }),
          I18n.t("profile.preferences.list.preferred_language.alert.subtitle"),
          [
            {
              text: I18n.t("global.buttons.cancel"),
              style: "cancel"
            },
            {
              text: I18n.t("global.buttons.confirm"),
              style: "default",
              onPress: () => handleAppLocaleChange(language as AppLocaleId)
            }
          ],
          { cancelable: false }
        );
      }
    },
    [handleAppLocaleChange, selectedAppLocale]
  );

  return (
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
      <VStack space={24}>
        <View>
          <ListItemHeader
            iconName="device"
            label={I18n.t(
              "profile.preferences.list.preferred_language.sections.app.title"
            )}
          />
          <BodySmall>
            {I18n.t(
              "profile.preferences.list.preferred_language.sections.app.description"
            )}
          </BodySmall>

          <VSpacer size={8} />

          <RadioGroup<AppLocaleId>
            type="radioListItem"
            items={appLocaleOptions}
            selectedItem={selectedAppLocale}
            onPress={onAppLanguageSelected}
          />
        </View>

        <View>
          <ListItemHeader
            iconName="email"
            label={I18n.t(
              "profile.preferences.list.preferred_language.sections.messages.title"
            )}
          />
          <BodySmall>
            {I18n.t(
              "profile.preferences.list.preferred_language.sections.messages.description"
            )}
          </BodySmall>

          <VSpacer size={8} />

          <RadioGroup<string>
            type="radioListItem"
            items={renderedItem}
            selectedItem={selectedItem}
            onPress={onLanguageSelected}
          />
        </View>
      </VStack>
    </IOScrollViewWithLargeHeader>
  );
};

export default LanguagesPreferencesScreen;
