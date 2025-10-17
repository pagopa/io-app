import {
  Divider,
  ListItemInfo,
  LoadingSpinner
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { IOIcons } from "@pagopa/io-app-design-system/src/components/icons/Icon.tsx";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useIOSelector } from "../../../store/hooks.ts";
import { toyProfileSelector } from "../store/selectors";
import LoadingSpinnerOverlay from "../../../components/LoadingSpinnerOverlay.tsx";

const ProfileFieldItem = ({
  label,
  icon,
  value
}: {
  label: string;
  icon: IOIcons;
  value?: string;
}) =>
  value ? (
    <>
      <ListItemInfo label={label} icon={icon} value={value} />
      <Divider />
    </>
  ) : null;

export const ProfileFields = () => {
  const toyProfilePot = useIOSelector(toyProfileSelector);

  const profile = pot.isSome(toyProfilePot) ? toyProfilePot.value : undefined;

  if (!profile) {
    return <LoadingSpinner />;
  }

  return (
    <LoadingSpinnerOverlay
      isLoading={pot.isNone(toyProfilePot) || pot.isLoading(toyProfilePot)}
    >
      {pot.isError(toyProfilePot) && (
        <ListItemInfo value={toyProfilePot.error.message} />
      )}
      {pot.isSome(toyProfilePot) && (
        <>
          <ProfileFieldItem
            label={I18n.t("profile.toy.main.nameSurname")}
            icon="profile"
            value={`${toyProfilePot.value.name} ${toyProfilePot.value.family_name}`}
          />
          <ProfileFieldItem
            label={I18n.t("profile.toy.main.fiscalCode")}
            icon="fiscalCodeIndividual"
            value={toyProfilePot.value.fiscal_code}
          />
          <ProfileFieldItem
            label={I18n.t("profile.toy.main.email")}
            icon="email"
            value={toyProfilePot.value.email}
          />
          {toyProfilePot.value.date_of_birth && (
            <ProfileFieldItem
              label={I18n.t("profile.toy.main.birthDate")}
              icon="calendar"
              value={toyProfilePot.value.date_of_birth.toLocaleDateString(
                I18n.language
              )}
            />
          )}
        </>
      )}
    </LoadingSpinnerOverlay>
  );
};
