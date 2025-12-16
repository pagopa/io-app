# Internationalization
For multi-language support the application uses:

* [react-native-i18n](https://github.com/AlexanderZaytsev/react-native-i18n) for the integration of translations with user preferences
* YAML files in the directory `locales`
* A YAML-to-typescript conversion script (`generate:locales`).

To add a new language you must:

1. Clone the repository
1. Create a new directory under [locales](locales) using the language code as the name (e.g. `es` for Spanish, `de` for German, etc...).
1. Copy the content from the base language [locales/en](en)(`en`).
1. Proceed with the translation by editing the YAML and Markdown files.
    - if is a YAML file (`*.yml`) translate only the text following the colon (e.g. `today:` **`"today"`** become in italian `today:` **`"oggi"`**).
    - if is a Mardown file (`*.md`) translate the text leaving the formatting as is.
1. Check that the command: ```npm run generate:locales``` (or ```yarn generate:locales```) returns a success message.
1. Create a PR using as title `Internationalization {New Language}` (e.g. `Internationalization Italiano`)and apply the label `internationalization`.

If you want to see the result in the app you must:

1. Run the command: ```npm run generate:locales```.
1. Edit the file [ts/i18n.ts](ts/i18n.ts) by adding the new language in the variable `I18n.translations`.

    E.g. for German
    ```
    I18n.translations = {
      en: locales.localeEN,
      it: locales.localeIT
    };
    ```
    become
    ```
    I18n.translations = {
      en: locales.localeEN,
      it: locales.localeIT
      de: locales.localeDE
    };
    ```