import {
  ContentWrapper,
  IOColors,
  ListItemAction,
  useIOTheme,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { View } from "react-native";

import { openWebUrl } from "../../../../../utils/url";

export const CgnMerchantCategoriesSocialLinks = () => {
  const theme = useIOTheme();

  const cgnSocialLinks = [
    {
      id: "instagram",
      iconName: "instagram",
      label: I18n.t(
        "bonus.cgn.merchantsList.categoriesList.socialLinks.instagram"
      ),
      url: "https://www.instagram.com/giovani_e_servizio_civile/"
    },
    {
      id: "facebook",
      iconName: "facebook",
      label: I18n.t(
        "bonus.cgn.merchantsList.categoriesList.socialLinks.facebook"
      ),
      url: "https://www.facebook.com/PcmGiovaniServiziocivile"
    },
    {
      id: "linkedin",
      iconName: "linkedin",
      label: I18n.t(
        "bonus.cgn.merchantsList.categoriesList.socialLinks.linkedin"
      ),
      url: "https://www.linkedin.com/company/carta-giovani-nazionale/"
    }
  ] as const;

  return (
    <View
      style={{
        backgroundColor: IOColors[theme["appBackground-secondary"]],
        flexGrow: 1
      }}
      testID="CgnMerchantCategoriesSocialLinks"
    >
      <VSpacer size={8} />
      <ContentWrapper>
        {cgnSocialLinks.map(socialLink => (
          <ListItemAction
            accessibilityRole="link"
            icon={socialLink.iconName}
            key={socialLink.id}
            label={socialLink.label}
            onPress={() => openWebUrl(socialLink.url)}
            variant="primary"
          />
        ))}
      </ContentWrapper>
      <VSpacer size={48} />
    </View>
  );
};
