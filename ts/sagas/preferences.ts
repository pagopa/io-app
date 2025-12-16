import * as O from "fp-ts/lib/Option";
import i18next from "i18next";
import { put, select } from "typed-redux-saga/macro";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { preferencesLanguagesLoadSuccess } from "../store/actions/preferences";
import { ReduxSagaEffect, SagaCallReturnType } from "../types/utils";
import { profileSelector } from "../features/settings/common/store/selectors";
import { preferredLanguageSelector } from "../store/reducers/persistedPreferences";
import { fromPreferredLanguageToLocale } from "../utils/locale";
import { preferredLanguageSaveSuccess } from "../store/actions/persistedPreferences";

/**
 * A saga that retrieves the system languages
 */
export function* loadSystemPreferencesSaga(): Generator<
  ReduxSagaEffect,
  void,
  SagaCallReturnType<any>
> {
  const languages = i18next.languages;
  yield* put(preferencesLanguagesLoadSuccess(languages));
}

/**
 * A saga that sets the app language
 */
export function* setLanguageFromProfileIfExists(): Generator<
  ReduxSagaEffect,
  void,
  any
> {
  const profile = yield* select(profileSelector);
  if (pot.isSome(profile)) {
    const preferredLanguages = profile.value.preferred_languages;
    const currentStoredLocale = yield* select(preferredLanguageSelector);

    // If a remote value is not present, the persisted preferences are not updated
    // and the device language (or the last one previously saved) is used
    if (!preferredLanguages || !preferredLanguages[0]) {
      return;
    }

    const preferredLanguage = fromPreferredLanguageToLocale(
      preferredLanguages[0]
    );

    // Updates persistedPreferences only if currentStoredLocale is different from the remote value.
    if (
      O.isNone(currentStoredLocale) ||
      (O.isSome(currentStoredLocale) &&
        currentStoredLocale.value !== preferredLanguage)
    ) {
      yield* put(
        preferredLanguageSaveSuccess({
          preferredLanguage
        })
      );
    }
  }
}
