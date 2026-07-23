import {
  ContentWrapper,
  HSpacer,
  IOColors,
  IOSpacingScale,
  IOText,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { Fragment } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import FacebookIcon from "../../../../../../img/features/cgn/facebook.svg";
import InstagramIcon from "../../../../../../img/features/cgn/instagram.svg";
import LinkedinIcon from "../../../../../../img/features/cgn/linkedin.svg";
import { openWebUrl } from "../../../../../utils/url";

const SOCIAL_LINKS_TOP_SPACING: IOSpacingScale = 32;
const SOCIAL_LINKS_BOTTOM_SPACING: IOSpacingScale = 48;
const SOCIAL_LINKS_V_SPACING: IOSpacingScale = 24;
const SOCIAL_ICON_SIZE = 32;
const SOCIAL_LINK_LABEL_SIZE = 16;
const SOCIAL_LINK_LABEL_LINE_HEIGHT = 20;

const cgnSocialLinks = [
  {
    Icon: InstagramIcon,
    id: "instagram",
    labelKey: "bonus.cgn.merchantsList.categoriesList.socialLinks.instagram",
    url: "https://www.instagram.com/ioitaliait/"
  },
  {
    Icon: FacebookIcon,
    id: "facebook",
    labelKey: "bonus.cgn.merchantsList.categoriesList.socialLinks.facebook",
    url: "https://www.facebook.com/io.italia.it/"
  },
  {
    Icon: LinkedinIcon,
    id: "linkedin",
    labelKey: "bonus.cgn.merchantsList.categoriesList.socialLinks.linkedin",
    url: "https://www.linkedin.com/company/io-app/"
  }
] as const;

const styles = StyleSheet.create({
  root: {
    flexGrow: 1
  },
  socialLinksContainer: {
    paddingBottom: SOCIAL_LINKS_BOTTOM_SPACING,
    paddingTop: SOCIAL_LINKS_TOP_SPACING
  },
  socialLink: {
    alignItems: "center",
    flexDirection: "row"
  },
  socialIcon: {
    alignItems: "center",
    height: SOCIAL_ICON_SIZE,
    justifyContent: "center",
    width: SOCIAL_ICON_SIZE
  }
});

export const CgnMerchantCategoriesSocialLinks = () => {
  const theme = useIOTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: IOColors[theme["appBackground-secondary"]] }
      ]}
      testID="CgnMerchantCategoriesSocialLinks"
    >
      <ContentWrapper>
        <View style={styles.socialLinksContainer}>
          {cgnSocialLinks.map((socialLink, index) => {
            const SocialIcon = socialLink.Icon;

            return (
              <Fragment key={socialLink.id}>
                {index > 0 && <VSpacer size={SOCIAL_LINKS_V_SPACING} />}
                <Pressable
                  accessibilityLabel={I18n.t(socialLink.labelKey)}
                  accessibilityRole="link"
                  onPress={() => openWebUrl(socialLink.url)}
                  style={styles.socialLink}
                  testID={`cgn-social-link-${socialLink.id}`}
                >
                  <View style={styles.socialIcon}>
                    <SocialIcon
                      height={SOCIAL_ICON_SIZE}
                      width={SOCIAL_ICON_SIZE}
                    />
                  </View>
                  <HSpacer size={16} />
                  <IOText
                    color="blueIO-500"
                    lineHeight={SOCIAL_LINK_LABEL_LINE_HEIGHT}
                    size={SOCIAL_LINK_LABEL_SIZE}
                    weight="Semibold"
                  >
                    {I18n.t(socialLink.labelKey)}
                  </IOText>
                </Pressable>
              </Fragment>
            );
          })}
        </View>
      </ContentWrapper>
    </View>
  );
};
