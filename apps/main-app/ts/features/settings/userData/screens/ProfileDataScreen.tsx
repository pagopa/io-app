import { ContentWrapper, Divider, ListItemInfo } from "@io-app/design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import I18n from "i18next";
import { ComponentProps, useCallback, useMemo } from "react";

import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import {
  hasProfileEmailSelector,
  profileEmailSelector,
  profileFiscalCodeSelector,
  profileNameSurnameSelector
} from "../../common/store/selectors";

type EndElementProps = ComponentProps<typeof ListItemInfo>["endElement"];

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
      description={I18n.t("profile.data.subtitle")}
      headerActionsProp={{ showHelp: true }}
      title={{
        label: I18n.t("profile.data.title")
      }}
    >
      <ContentWrapper>
        {/* Show name and surname */}
        {nameSurname && (
          <>
            <ListItemInfo
              label={I18n.t("profile.data.list.nameSurname")}
              testID="name-surname"
              // accessibilityLabel={I18n.t("profile.data.list.nameSurname")}
              value={nameSurname}
            />
            <Divider />
          </>
        )}
        {/* Show fiscal code */}
        {fiscalCode && (
          <>
            <ListItemInfo
              endElement={showFiscalCode}
              label={I18n.t("profile.data.list.fiscalCode")}
              // accessibilityLabel={I18n.t("profile.data.list.fiscalCode")}
              testID="show-fiscal-code"
              value={fiscalCode}
            />
            <Divider />
          </>
        )}
        {/* Insert or edit email */}
        <ListItemInfo
          endElement={editEmail}
          label={I18n.t("profile.data.list.email")}
          testID="insert-or-edit-email"
          // accessibilityLabel={I18n.t("profile.data.list.email")}
          value={email}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default ProfileDataScreen;
