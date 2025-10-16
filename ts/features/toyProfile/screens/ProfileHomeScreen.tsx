import {
  ContentWrapper,
  Divider,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { useDispatch, useSelector } from "react-redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useEffect } from "react";
import { emptyContextualHelp } from "../../../utils/emptyContextualHelp.tsx";
import { IOScrollViewWithLargeHeader } from "../../../components/ui/IOScrollViewWithLargeHeader.tsx";
import { getToyProfileDetailsAction } from "../store/actions";
import { toyProfileSelector } from "../store/selectors";
import { useIOSelector } from "../../../store/hooks.ts";

const ProfileHomeScreen = () => {
  const dispatch = useDispatch();
  const toyProfilePot = useSelector(toyProfileSelector);

  useEffect(() => {
    dispatch(getToyProfileDetailsAction.request());
  }, [dispatch]);

  const isLoading = pot.isLoading(toyProfilePot);
  const isError = pot.isError(toyProfilePot);
  const isSome = pot.isSome(toyProfilePot);

  return (
    <IOScrollViewWithLargeHeader
      title={{
        label: I18n.t("features.profile.title")
      }}
      contextualHelp={emptyContextualHelp}
      faqCategories={["profile"]}
      headerActionsProp={{ showHelp: true }}
    >
      <ContentWrapper>
        {isError && (
          <ListItemInfo value={toyProfilePot.error.message} />
        )}
        {isSome && (
          <>
            {toyProfilePot.value.name && toyProfilePot.value.family_name && (
              <>
                <ListItemInfo
                  label={I18n.t("profile.data.list.nameSurname")}
                  icon={"profile"}
                  value={
                    toyProfilePot.value.name +
                    " " +
                    toyProfilePot.value.family_name
                  }
                />
                <Divider />
              </>
            )}
            {toyProfilePot.value.fiscal_code && (
              <>
                <ListItemInfo
                  label={I18n.t("profile.data.list.fiscalCode")}
                  icon={"fiscalCodeIndividual"}
                  value={toyProfilePot.value.fiscal_code}
                />
                <Divider />
              </>
            )}
            {toyProfilePot.value.email && (
              <>
                <ListItemInfo
                  label={I18n.t("profile.data.list.email")}
                  icon={"email"}
                  value={toyProfilePot.value.email}
                />
                <Divider />
              </>
            )}
            {toyProfilePot.value.date_of_birth && (
              <>
                <ListItemInfo
                  label={I18n.t("profile.data.list.birthDate")}
                  icon={"calendar"}
                  value={toyProfilePot.value.date_of_birth.toLocaleDateString()}
                />
                <Divider />
              </>
            )}
          </>
        )}
      </ContentWrapper>
    </IOScrollViewWithLargeHeader>
  );
};

export { ProfileHomeScreen };
