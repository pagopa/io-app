# Internationalization
For multi-language support the application uses:

* [i18next](https://www.i18next.com/) for the integration of translations with user preferences
* JSON files in the directory `locales/{{lng}}` where `lng` is the language key code related to the source file in each directory 
* A script (`generate:locales`) to make the translation keys typesafe for code consistency.

To add a new language you must:

1. Clone the repository
1. Create a new directory under [locales](locales) using the language code as the name (e.g. `es` for Spanish, `de` for German, etc...).
1. Create a new file `index.json` under the new directory.
1. Copy the content from the base language [locales/it](it/index.json).
1. Replace Italian value strings with the translated one, but keep the key declaration (each JSON file **MUST** keep the same key structure).
1. Remove all non-translated keys, `I18next` will automatically proceed to use the base language value (`it` version).
1. Check that the command: ```npm run generate:locales``` (or ```yarn generate:locales```) returns a success message.
1. Create a PR using as title `Internationalization {New Language}` (e.g. `Internationalization Italiano`)and apply the label `internationalization`.

If you want to see the result in the app you must:

1. Run the command: ```npm run generate:locales```.
1. Edit the file [ts/i18n.ts](../ts/i18n.ts) by adding the new language source file in the resource object.

    E.g. for German
    ```
    import it from "../locales/it/index.json";
    import en from "../locales/en/index.json";
    import de from "../locales/de/index.json";
    
    // ...other imports
    
    const resources = {
      it: {
        index: it
      },
      en: {
        index: en
      },
      de: {
        index: de
      }
    };
    ```
    become
    ```
    import it from "../locales/it/index.json";
    import en from "../locales/en/index.json";
    import de from "../locales/de/index.json";
    import es from "../locales/es/index.json";
    
    // ...other imports
    
    const resources = {
      it: {
        index: it
      },
      en: {
        index: en
      },
      de: {
        index: de
      },
      es: {
        indes: es
      }
    };
    ```