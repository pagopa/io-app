import {
  Banner,
  ContentWrapper,
  IOMarkdownLite,
  VSpacer
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useMemo } from "react";

import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch } from "../../../../store/hooks";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";
import { loadBonusBeforeRemoveAccount } from "../../common/store/actions";

/**
 * A screen to explain how the account removal works.
 * Here user can ask to delete his account
 */
const RemoveAccountInfo = () => {
  const dispatch = useIODispatch();
  const { navigate } = useIONavigation();

  const actions = useMemo<IOScrollViewActions>(
    () => ({
      type: "SingleButton",
      primary: {
        color: "danger",
        label: I18n.t("profile.main.privacy.removeAccount.info.cta"),
        accessibilityLabel: I18n.t(
          "profile.main.privacy.removeAccount.info.cta"
        ),
        onPress: () => {
          dispatch(loadBonusBeforeRemoveAccount());
          navigate(SETTINGS_ROUTES.PROFILE_NAVIGATOR, {
            screen: SETTINGS_ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS
          });
        }
      }
    }),
    [dispatch, navigate]
  );

  return (
    <IOScrollViewWithLargeHeader
      actions={actions}
      description={I18n.t(
        "profile.main.privacy.removeAccount.info.description"
      )}
      title={{
        label: I18n.t("profile.main.privacy.removeAccount.info.title")
      }}
    >
      <VSpacer size={8} />
      <ContentWrapper>
        <Banner
          color="neutral"
          content={I18n.t("profile.main.privacy.removeAccount.info.banner")}
          pictogramName="attention"
        />
        <VSpacer size={24} />
        <IOMarkdownLite
          content={I18n.t("profile.main.privacy.removeAccount.info.body")}
        />
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default RemoveAccountInfo;
