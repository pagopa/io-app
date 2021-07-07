import * as React from "react";
import { StyleSheet, View } from "react-native";

import { TranslationKeys } from "../../../locales/locales";
import I18n from "../../i18n";
import { openWebUrl } from "../../utils/url";
import { showToast } from "../../utils/showToast";

import IconFont from "../ui/IconFont";
import { H3 } from "../core/typography/H3";
import { Link } from "../core/typography/Link";
import { IOColors } from "../core/variables/IOColors";
import ItemSeparatorComponent from "../ItemSeparatorComponent";

const styles = StyleSheet.create({
  link: {
    paddingVertical: 16
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

const renderLinkRow = (text: TranslationKeys, href: string) => (
  <>
    <Link
      ellipsizeMode={"tail"}
      onPress={() =>
        openWebUrl(href, () => showToast(I18n.t("global.jserror.title")))
      }
      numberOfLines={1}
      style={styles.link}
    >
      {I18n.t(text)}
    </Link>
    <ItemSeparatorComponent noPadded />
  </>
);

/**
 * Renders a dedicated section with TOS, Privacy urls, and the header.
 * It **doesn't render** if both links are not defined!
 */
const TosAndPrivacy: React.FC<Props> = ({ tosUrl, privacyUrl }) => {
  if (tosUrl === undefined && privacyUrl === undefined) {
    return null;
  }
  return (
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
      {tosUrl && renderLinkRow("services.tosLink", tosUrl)}
      {privacyUrl && renderLinkRow("services.privacyLink", privacyUrl)}
    </View>
  );
};

export default TosAndPrivacy;
