import { List } from "native-base";
import * as pot from "italia-ts-commons/lib/pot";
import * as React from "react";
import { Alert } from "react-native";
import { connect } from "react-redux";
import { fromNullable } from "fp-ts/lib/Option";
import { Locales, TranslationKeys } from "../../../locales/locales";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n, { availableTransations } from "../../i18n";
import { preferredLanguageSaveSuccess } from "../../store/actions/persistedPreferences";
import { Dispatch } from "../../store/actions/types";
import { preferredLanguageSelector } from "../../store/reducers/persistedPreferences";
import { GlobalState } from "../../store/reducers/types";
import {
  fromLocaleToPreferredLanguage,
  getLocalePrimaryWithFallback
} from "../../utils/locale";
import { profileUpsert } from "../../store/actions/profile";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { profileSelector } from "../../store/reducers/profile";
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
    this.props.preferredLanguage
      .map(l => l === language)
      .getOrElse(getLocalePrimaryWithFallback() === language);

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
      fromNullable(this.state.selectedLocale).map(
        this.props.preferredLanguageSaveSuccess
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
        <ScreenContent
          title={I18n.t("profile.preferences.list.preferred_language.title")}
          subtitle={I18n.t(
            "profile.preferences.list.preferred_language.subtitle"
          )}
        >
          <List withContentLateralPadding={true}>
            {availableTransations.map((lang, index) => {
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
                  iconName={isSelectedLanguage ? "io-tick-big" : undefined}
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
