import { IOIconSizeScale } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { List } from "native-base";
import * as React from "react";
import { Alert, SafeAreaView, View } from "react-native";
import { connect } from "react-redux";
import { Locales, TranslationKeys } from "../../../locales/locales";
import SectionStatusComponent from "../../components/SectionStatus";
import { withLoadingSpinner } from "../../components/helpers/withLoadingSpinner";
import { ContextualHelpPropsMarkdown } from "../../components/screens/BaseScreenComponent";
import ListItemComponent from "../../components/screens/ListItemComponent";
import { AlertModal } from "../../components/ui/AlertModal";
import {
  LightModalContext,
  LightModalContextInterface
} from "../../components/ui/LightModal";
import { RNavScreenWithLargeHeader } from "../../components/ui/RNavScreenWithLargeHeader";
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

type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

type State = { isLoading: boolean; selectedLocale?: Locales };

type LanguagesPreferencesScreenProps = Props & LightModalContextInterface;

const iconSize: IOIconSizeScale = 12;

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.language.contextualHelpTitle",
  body: "profile.preferences.language.contextualHelpContent"
};

/**
 * Allows the user to select one of the available Languages as preferred
 */
class LanguagesPreferencesScreen extends React.PureComponent<
  LanguagesPreferencesScreenProps,
  State
> {
  constructor(props: LanguagesPreferencesScreenProps) {
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
      <RNavScreenWithLargeHeader
        title={{
          label: I18n.t("profile.preferences.list.preferred_language.title")
        }}
        description={I18n.t(
          "profile.preferences.list.preferred_language.subtitle"
        )}
        fixedBottomSlot={
          <SafeAreaView>
            <SectionStatusComponent sectionKey={"favourite_language"} />
          </SafeAreaView>
        }
        contextualHelpMarkdown={contextualHelpMarkdown}
        headerActionsProp={{ showHelp: true }}
      >
        <View style={{ justifyContent: "space-between", flexGrow: 1 }}>
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
                  iconName={isSelectedLanguage ? "checkTickBig" : undefined}
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
        </View>
      </RNavScreenWithLargeHeader>
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

const LanguagesPreferencesScreenFC = (props: Props) => {
  const { ...modalContext } = React.useContext(LightModalContext);
  return <LanguagesPreferencesScreen {...props} {...modalContext} />;
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(LanguagesPreferencesScreenFC);
