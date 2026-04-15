import {
  Banner,
  ContentWrapper,
  IOMarkdownLite,
  VSpacer
} from "@pagopa/io-app-design-system";
import { useMemo } from "react";
import I18n from "i18next";
import { loadBonusBeforeRemoveAccount } from "../../common/store/actions";
import { useIODispatch } from "../../../../store/hooks";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { IOScrollViewWithLargeHeader } from "../../../../components/ui/IOScrollViewWithLargeHeader";
import { IOScrollViewActions } from "../../../../components/ui/IOScrollView";
import { SETTINGS_ROUTES } from "../../common/navigation/routes";

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
      title={{
        label: I18n.t("profile.main.privacy.removeAccount.info.title")
      }}
      description={I18n.t(
        "profile.main.privacy.removeAccount.info.description"
      )}
      actions={actions}
    >
      <VSpacer size={8} />
      <ContentWrapper>
        <Banner
          color="neutral"
          pictogramName="attention"
          content={I18n.t("profile.main.privacy.removeAccount.info.banner")}
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
