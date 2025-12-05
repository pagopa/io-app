import {
  ContentWrapper,
  Divider,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { ComponentProps, useCallback, useMemo } from "react";
import I18n from "i18next";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import {
  hasProfileEmailSelector,
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../common/store/selectors";
import { useIOSelector } from "../../../../store/hooks";
import { FAQsCategoriesType } from "../../../../utils/faq";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import { ContextualHelpPropsMarkdown } from "../../../../utils/contextualHelp";

type EndElementProps = ComponentProps<typeof ListItemInfo>["endElement"];

const FAQ_CATEGORIES: ReadonlyArray<FAQsCategoriesType> = [
  "profile",
  "privacy",
  "authentication_SPID"
];

const contextualHelpMarkdown: ContextualHelpPropsMarkdown = {
  title: "profile.preferences.contextualHelpTitle",
  body: "profile.preferences.contextualHelpContent"
};

const ProfileDataScreen = () => {
  const { navigate } = useIONavigation();
  const profileEmail = useIOSelector(profileEmailSelector);
  const hasProfileEmail = useIOSelector(hasProfileEmailSelector);
  const nameSurname = useIOSelector(profileNameSurnameSelector);
  const fiscalCode = useIOSelector(profileFiscalCodeSelector);

  const onPressEmail = useCallback(() => {
    if (hasProfileEmail) {
      navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
        screen: SETTINGS_ROUTES.INSERT_EMAIL_SCREEN,
        params: {
          isOnboarding: false
        }
      });
    }
  }, [hasProfileEmail, navigate]);

  const email = useMemo(
    () =>
      pipe(
        profileEmail,
        O.getOrElse(() => I18n.t("global.remoteStates.notAvailable"))
      ),
    [profileEmail]
  );

  const showFiscalCode = useMemo<EndElementProps>(() => {
    const label = I18n.t("global.buttons.show");

    return {
      type: "buttonLink",
      componentProps: {
        onPress: () => {
          navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
            screen: SETTINGS_ROUTES.PROFILE_FISCAL_CODE
          });
        },
        label,
        accessibilityLabel: label,
        testID: "show-fiscal-code-cta"
      }
    };
  }, [navigate]);

  const editEmail = useMemo<EndElementProps>(() => {
    const label = I18n.t("global.buttons.edit");

    return {
      type: "buttonLink",
      componentProps: {
        onPress: onPressEmail,
        label,
        accessibilityLabel: label,
        testID: "insert-or-edit-email-cta"
      }
    };
  }, [onPressEmail]);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("profile.data.title")
      }}
      description={I18n.t("profile.data.subtitle")}
      headerActionsProp={{ showHelp: true }}
      contextualHelpMarkdown={contextualHelpMarkdown}
      faqCategories={FAQ_CATEGORIES}
    >
      <ContentWrapper>
        {/* Show name and surname */}
        {nameSurname && (
          <>
            <ListItemInfo
              label={I18n.t("profile.data.list.nameSurname")}
              // accessibilityLabel={I18n.t("profile.data.list.nameSurname")}
              value={nameSurname}
              testID="name-surname"
            />
            <Divider />
          </>
        )}
        {/* Show fiscal code */}
        {fiscalCode && (
          <>
            <ListItemInfo
              label={I18n.t("profile.data.list.fiscalCode")}
              // accessibilityLabel={I18n.t("profile.data.list.fiscalCode")}
              testID="show-fiscal-code"
              value={fiscalCode}
              endElement={showFiscalCode}
            />
            <Divider />
          </>
        )}
        {/* Insert or edit email */}
        <ListItemInfo
          label={I18n.t("profile.data.list.email")}
          // accessibilityLabel={I18n.t("profile.data.list.email")}
          value={email}
          endElement={editEmail}
          testID="insert-or-edit-email"
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default ProfileDataScreen;
