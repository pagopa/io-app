import { fromNullable } from "fp-ts/lib/Option";
import { List } from "native-base";
import * as React from "react";
import { NavigationInjectedProps } from "react-navigation";
import { connect } from "react-redux";
import { Locales } from "../../../locales/locales";
import { RTron } from "../../boot/configureStoreAndPersistor";
import { withLightModalContext } from "../../components/helpers/withLightModalContext";
import LoadingSpinnerOverlay from "../../components/LoadingSpinnerOverlay";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import ScreenContent from "../../components/screens/ScreenContent";
import TopScreenComponent from "../../components/screens/TopScreenComponent";
import { AlertModal } from "../../components/ui/AlertModal";
import { LightModalContextInterface } from "../../components/ui/LightModal";
import I18n from "../../i18n";
import { preferredLanguageSaveSuccess } from "../../store/actions/persistedPreferences";
import { Dispatch } from "../../store/actions/types";
import { GlobalState } from "../../store/reducers/types";

const SUPPORTED_LANGUAGES: ReadonlyArray<Locales> = ["it", "en"];

type OwnProps = NavigationInjectedProps;

type Props = LightModalContextInterface &
  ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps> &
  OwnProps;

type State = {
  isLoading: boolean;
};

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.language.contextualHelpTitle",
  body: "profile.preferences.language.contextualHelpContent"
};

/**
 * Allows the user to select one of the device available Calendars
 */
class LanguagesPreferencesScreen extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false
    };
  }

  private onLanguageSelected = (language: Locales) => {
    const { preferredLanguage } = this.props;
    const isAlreadyPreferred = fromNullable(preferredLanguage).fold(
      false,
      l => l === language
    );
    if (!isAlreadyPreferred) {
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
    const { isLoading } = this.state;
    const { preferredLanguage } = this.props;
    return (
      <LoadingSpinnerOverlay isLoading={isLoading}>
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
              {SUPPORTED_LANGUAGES.map((lang, index) => {
                const isSelectedLanguage = fromNullable(preferredLanguage).fold(
                  false,
                  l => l === lang
                );
                RTron.log(isSelectedLanguage, preferredLanguage, lang);
                return (
                  <ListItemComponent
                    key={index}
                    title={I18n.t(`locales.${lang}`, { defaultValue: lang })}
                    hideIcon={!isSelectedLanguage}
                    iconSize={12}
                    iconName={isSelectedLanguage ? "io-tick-big" : undefined}
                    onPress={() => this.onLanguageSelected(lang)}
                  />
                );
              })}
            </List>
          </ScreenContent>
        </TopScreenComponent>
      </LoadingSpinnerOverlay>
    );
  }
}

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: state.persistedPreferences.preferredLanguage
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
