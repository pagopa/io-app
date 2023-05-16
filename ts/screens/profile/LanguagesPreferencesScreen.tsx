import * as pot from "@pagopa/ts-commons/lib/pot";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import { List } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView } from "react-native";
import { connect } from "react-redux";
import { Locales, TranslationKeys } from "../../../locales/locales";
import { IOStyles } from "../../components/core/variables/IOStyles";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import SectionStatusComponent from "../../components/SectionStatus";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n, { availableTranslations } from "../../i18n";
import { preferredLanguageSaveSuccess } from "../../store/actions/persistedPreferences";
import { profileUpsert } from "../../store/actions/profile";
import { Dispatch } from "../../store/actions/types";
import { preferredLanguageSelector } from "../../store/reducers/persistedPreferences";
import { profileSelector } from "../../store/reducers/profile";
import { GlobalState } from "../../store/reducers/types";
import {
  fromLocaleToPreferredLanguage,
  getLocalePrimaryWithFallback
} from "../../utils/locale";
import { showToast } from "../../utils/showToast";

type Props = LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = { isLoading: boolean; selectedLocale?: Locales };

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.language.contextualHelpTitle",
  body: "profile.preferences.language.contextualHelpContent"
};

const iconSize = 12;

/**
 * Allows the user to select one of the available Languages as preferred
 */
class LanguagesPreferencesScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { isLoading: false };
  }

  private isAlreadyPreferred = (language: Locales) =>
    // if the preferred Lanuage is not set, we check if language is the same in use
    pipe(
      this.props.preferredLanguage,
      O.map(l => l === language),
      O.getOrElse(() => getLocalePrimaryWithFallback() === language)
    );

  private onLanguageSelected = (language: Locales) => {
    if (!this.isAlreadyPreferred(language)) {
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
              this.setState({ selectedLocale: language }, () => {
                this.props.upsertProfile(language);
              });
            }
          }
        ],
        { cancelable: false }
      );
    }
  };

  public componentDidUpdate(prevProps: Readonly<Props>) {
    // start updating
    if (pot.isUpdating(this.props.profile)) {
      this.setState({ isLoading: true });
      return;
    }

    // update completed
    if (pot.isUpdating(prevProps.profile) && pot.isSome(this.props.profile)) {
      this.setState({ isLoading: false });
      pipe(
        this.state.selectedLocale,
        O.fromNullable,
        O.map(this.props.preferredLanguageSaveSuccess)
      );
      this.showModal();
      return;
    }

    // update error
    if (pot.isUpdating(prevProps.profile) && pot.isError(this.props.profile)) {
      showToast(I18n.t("errors.profileUpdateError"));
    }
  }

  private showModal() {
    this.props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  }

  public render() {
    const ContainerComponent = withLoadingSpinner(() => (
      <TopScreenComponent
        contextualHelpMarkdown={contextualHelpMarkdown}
        headerTitle={I18n.t("profile.preferences.title")}
        goBack={true}
      >
        <SafeAreaView style={IOStyles.flex}>
          <ScreenContent
            title={I18n.t("profile.preferences.list.preferred_language.title")}
            subtitle={I18n.t(
              "profile.preferences.list.preferred_language.subtitle"
            )}
          >
            <List withContentLateralPadding={true}>
              {availableTranslations.map((lang, index) => {
                const isSelectedLanguage = this.isAlreadyPreferred(lang);
                const languageTitle = I18n.t(`locales.${lang}`, {
                  defaultValue: lang
                });
                return (
                  <ListItemComponent
                    key={index}
                    title={languageTitle}
                    hideIcon={!isSelectedLanguage}
                    iconSize={iconSize}
                    iconName={isSelectedLanguage ? "legCompleted" : undefined}
                    onPress={() => this.onLanguageSelected(lang)}
                    accessible={true}
                    accessibilityRole={"radio"}
                    accessibilityLabel={`${languageTitle}, ${
                      isSelectedLanguage
                        ? I18n.t("global.accessibility.active")
                        : I18n.t("global.accessibility.inactive")
                    }`}
                  />
                );
              })}
            </List>
          </ScreenContent>
          <SectionStatusComponent sectionKey={"favourite_language"} />
        </SafeAreaView>
      </TopScreenComponent>
    ));
    return <ContainerComponent isLoading={this.state.isLoading} />;
  }
}

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state),
  profile: profileSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  preferredLanguageSaveSuccess: (language: Locales) =>
    dispatch(
      preferredLanguageSaveSuccess({
        preferredLanguage: language
      })
    ),
  upsertProfile: (language: Locales) =>
    dispatch(
      profileUpsert.request({
        preferred_languages: [fromLocaleToPreferredLanguage(language)]
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(LanguagesPreferencesScreen));
