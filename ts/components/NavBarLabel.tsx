import { fromNullable } from "fp-ts/lib/Option";
import * as React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { connect } from "react-redux";
import { Locales, TranslationKeys } from "../../locales/locales";
import I18n from "../i18n";
import ROUTES from "../navigation/routes";
import { preferredLanguageSelector } from "../store/reducers/persistedPreferences";
import { GlobalState } from "../store/reducers/types";
import { makeFontStyleObject } from "../theme/fonts";
import variables from "../theme/variables";

type Routes = keyof typeof ROUTES;

type OwnProps = {
  options: {
    tintColor: string | null;
    focused: boolean;
  };
  routeName: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

type RouteLabelMap = { [key in Routes]?: TranslationKeys };
const ROUTE_LABEL: RouteLabelMap = {
  MESSAGES_NAVIGATOR: "global.navigator.messages",
  WALLET_HOME: "global.navigator.wallet",
  DOCUMENTS_HOME: "global.navigator.documents",
  SERVICES_NAVIGATOR: "global.navigator.services",
  PROFILE_NAVIGATOR: "global.navigator.profile"
};
const fallbackLabel = "unknown"; // fallback label

const getLabel = (routeName: string, locale: Locales): string => {
  // "routeName as Routes" is assumed to be safe as explained @https://github.com/pagopa/io-app/pull/193#discussion_r192347234
  // adding fallback anyway -- better safe than sorry
  return fromNullable(ROUTE_LABEL[routeName as Routes]).fold(fallbackLabel, l =>
    I18n.t(l, { locale })
  );
};

const styles = StyleSheet.create({
  labelStyle: {
    ...makeFontStyleObject(Platform.select),
    textAlign: "center",
    fontSize: variables.fontSizeSmaller
  }
});

/**
 * This Component is used to Render the Labels of the bottom navbar of the app
 * translated in the preferred locale if it was selected
 * @param props
 */
const NavBarLabel: React.FunctionComponent<Props> = (props: Props) => {
  const { options, routeName, preferredLanguage } = props;
  const locale: Locales = preferredLanguage.fold(I18n.locale, l => l);
  return (
    <Text
      style={[
        styles.labelStyle,
        {
          color: options.tintColor === null ? undefined : options.tintColor
        }
      ]}
    >
      {getLabel(routeName, locale)}
    </Text>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state)
});

export default connect(mapStateToProps)(NavBarLabel);
