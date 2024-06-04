import {
  Banner,
  Body,
  ContentWrapper,
  H2,
  IOToast,
  RadioGroup,
  RadioItem,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, { createRef, useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Alert, View } from "react-native";
import { pot } from "@pagopa/ts-commons";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import I18n, { availableTranslations } from "../../i18n";
import { useHeaderSecondLevel } from "../../hooks/useHeaderSecondLevel";
import { useIODispatch, useIOSelector } from "../../store/hooks";
import { preferredLanguageSelector } from "../../store/reducers/persistedPreferences";
import { Locales, TranslationKeys } from "../../../locales/locales";
import { profileUpsert } from "../../store/actions/profile";
import { fromLocaleToPreferredLanguage } from "../../utils/locale";
import { profileSelector } from "../../store/reducers/profile";
import { usePrevious } from "../../utils/hooks/usePrevious";
import { preferredLanguageSaveSuccess } from "../../store/actions/persistedPreferences";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { openWebUrl } from "../../utils/url";

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
  const [isLoading, setIsLoading] = useState(false);
  const profile = useIOSelector(profileSelector);
  const prevProfile = usePrevious(profile);
  const preferredLanguageSelect = useIOSelector(preferredLanguageSelector);
  const preferredLanguage = pipe(
    preferredLanguageSelect,
    O.getOrElse(() => "it")
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

  const renderedItem: Array<RadioItem<string>> = availableTranslations.map(
    item => ({
      value: I18n.t(`locales.${item}`, {
        defaultValue: item
      }),
      id: item,
      techName: `${item}-${item.toUpperCase()}`
    })
  );

  const initialSelectedItem = renderedItem.find(
    item => item.id === preferredLanguage
  )?.id;

  const [selectedItem, setSelectedItem] = useState(initialSelectedItem);

  useEffect(() => {
    // start updating
    if (pot.isUpdating(profile)) {
      setIsLoading(true);
      return;
    }

    // update completed
    if (prevProfile && pot.isUpdating(prevProfile) && pot.isSome(profile)) {
      setIsLoading(false);
      preferredLanguageSaveSuccessDispatch(selectedItem as Locales);
      return;
    }

    // update error
    if (prevProfile && pot.isUpdating(prevProfile) && pot.isError(profile)) {
      setIsLoading(false);
      IOToast.error(I18n.t("errors.profileUpdateError"));
    }
  }, [
    preferredLanguageSaveSuccessDispatch,
    prevProfile,
    profile,
    selectedItem
  ]);

  const onLanguageSelected = useCallback(
    (language: string) => {
      if (selectedItem !== language) {
        Alert.alert(
          I18n.t("profile.preferences.list.preferred_language.alert.title") +
            " " +
            I18n.t(`locales.${language}` as TranslationKeys) +
            "?",
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
                setSelectedItem(language);
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

  useHeaderSecondLevel({
    title: "",
    contextualHelpMarkdown,
    canGoBack: true,
    supportRequest: true
  });

  return (
    <LoadingSpinnerOverlay isLoading={isLoading}>
      <SafeAreaView edges={["bottom"]}>
        <ContentWrapper>
          <H2>{I18n.t("profile.preferences.list.preferred_language.title")}</H2>
          <VSpacer size={16} />
          <Body>
            {I18n.t("profile.preferences.list.preferred_language.subtitle")}
          </Body>
          <VSpacer size={16} />
          <RadioGroup<string>
            type="radioListItem"
            items={renderedItem}
            selectedItem={selectedItem}
            onPress={onLanguageSelected}
          />
          <VSpacer size={16} />

          <Banner
            viewRef={viewRef}
            color="neutral"
            size="big"
            content={I18n.t(
              "profile.preferences.list.preferred_language.banner.title"
            )}
            pictogramName="charity"
            action={I18n.t(
              "profile.preferences.list.preferred_language.banner.button"
            )}
            onPress={() =>
              openWebUrl("https://github.com/pagopa/io-app/issues/new/choose")
            }
          />
        </ContentWrapper>
      </SafeAreaView>
    </LoadingSpinnerOverlay>
  );
};

export default LanguagesPreferencesScreen;
