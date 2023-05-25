import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { Platform, StyleSheet, Text } from "react-native";
import { connect } from "react-redux";
import { Locales, TranslationKeys } from "../../locales/locales";
import I18n from "../i18n";
import ROUTES from "../navigation/routes";
import { messagesUnreadAndUnarchivedSelector } from "../store/reducers/entities/messages/messagesStatus";
import { preferredLanguageSelector } from "../store/reducers/persistedPreferences";
import { GlobalState } from "../store/reducers/types";
import { makeFontStyleObject } from "../theme/fonts";

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
  SERVICES_NAVIGATOR: "global.navigator.services",
  PROFILE_NAVIGATOR: "global.navigator.profile"
};
const fallbackLabel = "unknown"; // fallback label

const routeOrder = new Map<Routes, number>([
  ["MESSAGES_NAVIGATOR", 1],
  ["WALLET_HOME", 2],
  ["SERVICES_NAVIGATOR", 3],
  ["PROFILE_NAVIGATOR", 4]
]);

const getLabel = (routeName: string, locale: Locales): string =>
  // "routeName as Routes" is assumed to be safe as explained @https://github.com/pagopa/io-app/pull/193#discussion_r192347234
  // adding fallback anyway -- better safe than sorry
  pipe(
    ROUTE_LABEL[routeName as Routes],
    O.fromNullable,
    O.fold(
      () => fallbackLabel,
      l => I18n.t(l, { locale })
    )
  );
const styles = StyleSheet.create({
  labelStyle: {
    ...makeFontStyleObject(Platform.select),
    textAlign: "center"
  }
});

const computeAccessibilityLabel = (
  section: string,
  order: number,
  unread?: number
) =>
  typeof unread === "undefined"
    ? I18n.t("navigation.accessibility", {
        section,
        order
      })
    : I18n.t("navigation.accessibilityWithBadge", {
        section,
        order,
        unread
      });

/**
 * This Component is used to Render the Labels of the bottom navbar of the app
 * translated in the preferred locale if it was selected
 * @param props
 */
const NavBarLabel: React.FunctionComponent<Props> = (props: Props) => {
  const { options, routeName, preferredLanguage, messagesUnread } = props;
  const locale: Locales = pipe(
    preferredLanguage,
    O.fold(
      () => I18n.locale,
      l => l
    )
  );
  const label = getLabel(routeName, locale);
  const maybeOrder = O.fromNullable(routeOrder.get(routeName as Routes));
  const isSelected = options.focused
    ? `${I18n.t("navigation.selected")}, `
    : "";

  const unreadMessagesMap: Record<string, number> = {
    [ROUTES.MESSAGES_NAVIGATOR]: messagesUnread.length
  };

  const computedUnreadMessages = unreadMessagesMap[routeName] || undefined;

  const panelAccessibilityLabel = computeAccessibilityLabel(
    label,
    O.getOrElse(() => 0)(maybeOrder),
    computedUnreadMessages
  );

  return (
    <Text
      style={[
        styles.labelStyle,
        {
          color: options.tintColor === null ? undefined : options.tintColor
        }
      ]}
      accessibilityLabel={`${isSelected} ${panelAccessibilityLabel}`}
    >
      {label}
    </Text>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  preferredLanguage: preferredLanguageSelector(state),
  messagesUnread: messagesUnreadAndUnarchivedSelector(state)
});

export default connect(mapStateToProps)(NavBarLabel);
