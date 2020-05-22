import { fromNullable } from "fp-ts/lib/Option";
import { List } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Locales } from "../../../locales/locales";
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
import { getLocalePrimary } from "../../utils/locale";

type OwnProps = NavigationInjectedProps;

type Props = LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.language.contextualHelpTitle",
  body: "profile.preferences.language.contextualHelpContent"
};

const iconSize = 12;

/**
 * Allows the user to select one of the device available Calendars
 */
class LanguagesPreferencesScreen extends React.PureComponent<Props> {
  private isAlreadyPreferred = (language: Locales) => {
    // if the preferred Lanuage is not set, we check if language is the same in use
    return this.props.preferredLanguage
      .map(l => l === language)
      .getOrElse(
        getLocalePrimary(I18n.locale).fold(false, l => l === language)
      );
  };

  private onLanguageSelected = (language: Locales) => {
    // TODO show an alert to confirm the language change
    if (!this.isAlreadyPreferred(language)) {
      this.props.preferredLanguageSaveSuccess(language);
      this.showModal();
    }
  };

  private showModal() {
    this.props.showModal(
      <AlertModal
        message={I18n.t("profile.main.pagoPaEnvironment.alertMessage")}
      />
    );
  }

  public render() {
    return (
      <TopScreenComponent
        contextualHelpMarkdown={contextualHelpMarkdown}
        headerTitle={I18n.t("profile.preferences.title")}
        goBack={this.props.navigation.goBack}
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
              return (
                <ListItemComponent
                  key={index}
                  title={I18n.t(`locales.${lang}`, { defaultValue: lang })}
                  hideIcon={!isSelectedLanguage}
                  iconSize={iconSize}
                  iconName={isSelectedLanguage ? "io-tick-big" : undefined}
                  onPress={() => this.onLanguageSelected(lang)}
                />
              );
            })}
          </List>
        </ScreenContent>
      </TopScreenComponent>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state)
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
  preferredLanguageSaveSuccess: (language: Locales) =>
    dispatch(
      preferredLanguageSaveSuccess({
        preferredLanguage: language
      })
    )
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLightModalContext(LanguagesPreferencesScreen));
