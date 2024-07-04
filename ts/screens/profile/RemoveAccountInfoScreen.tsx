import {
  Banner,
  Body,
  ContentWrapper,
  VSpacer
} from "@pagopa/io-app-design-system";
import React, { useMemo } from "react";
import I18n from "../../i18n";
import { loadBonusBeforeRemoveAccount } from "../../store/actions/profile";
import { useIODispatch } from "../../store/hooks";
import { useIONavigation } from "../../navigation/params/AppParamsList";
import ROUTES from "../../navigation/routes";
import { IOScrollViewWithLargeHeader } from "../../components/ui/IOScrollViewWithLargeHeader";
import { IOScrollViewActions } from "../../components/ui/IOScrollView";

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
          navigate(ROUTES.PROFILE_NAVIGATOR, {
            screen: ROUTES.PROFILE_REMOVE_ACCOUNT_DETAILS
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
          size="big"
          pictogramName="attention"
          content={I18n.t("profile.main.privacy.removeAccount.info.banner")}
        />
        <VSpacer size={24} />
        <Body weight="Regular">
          {I18n.t("profile.main.privacy.removeAccount.info.body.p1")}
        </Body>
        <VSpacer size={16} />
        <Body>
          <Body>
            {I18n.t(
              "profile.main.privacy.removeAccount.info.body.p2.firstPart"
            )}
          </Body>
          <Body weight="Bold">
            {I18n.t("profile.main.privacy.removeAccount.info.body.p2.lastPart")}
          </Body>
        </Body>
        <VSpacer size={16} />
        <Body weight="Regular">
          {I18n.t("profile.main.privacy.removeAccount.info.body.p3")}
        </Body>
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export default RemoveAccountInfo;
