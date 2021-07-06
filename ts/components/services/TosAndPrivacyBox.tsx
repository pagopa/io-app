import * as React from "react";
import { StyleSheet, View } from "react-native";

import { TranslationKeys } from "../../../locales/locales";
import I18n from "../../i18n";
import { handleItemOnPress } from "../../utils/url";

import IconFont from "../ui/IconFont";
import { H3 } from "../core/typography/H3";
import { Link } from "../core/typography/Link";
import { IOColors } from "../core/variables/IOColors";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

const styles = StyleSheet.create({
  infoItem: {
    paddingVertical: 16,
    flex: 1
  },
  header: {
    flexDirection: "row",
    paddingVertical: 8
  },
  icon: {
    marginRight: 3.85
  }
});

type Props = {
  privacyUrl?: string;
  tosUrl?: string;
};

/**
 * Renders a dedicated section with TOS, Privacy urls, and the header.
 */
const TosAndPrivacy: React.FC<Props> = ({ tosUrl, privacyUrl }) => (
  <View>
    <View style={styles.header}>
      <IconFont
        name={"io-lucchetto"}
        color={IOColors.bluegrey}
        style={styles.icon}
      />
      <H3 weight={"SemiBold"} color={"bluegrey"}>
        {I18n.t("services.tosAndPrivacy")}
      </H3>
    </View>
    {tosUrl && (
      <>
        {renderLinkRow("services.tosLink", tosUrl)}
        <ItemSeparatorComponent noPadded />
      </>
    )}
    {privacyUrl && (
      <>
        {renderLinkRow("services.privacyLink", privacyUrl)}
        <ItemSeparatorComponent noPadded />
      </>
    )}
    <ItemSeparatorComponent noPadded />
  </View>
);

const renderLinkRow = (text: TranslationKeys, href: string) => (
  <View style={styles.infoItem}>
    <Link
      ellipsizeMode={"tail"}
      onPress={handleItemOnPress(href)}
      numberOfLines={1}
    >
      {I18n.t(text)}
    </Link>
  </View>
);

export default TosAndPrivacy;
