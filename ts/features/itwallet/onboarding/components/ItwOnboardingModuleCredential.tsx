import { Badge, IOIcons, ModuleCredential } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { memo, useMemo } from "react";
import { getCredentialNameFromType } from "../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../common/utils/itwMocksUtils";
import { useIOSelector } from "../../../../store/hooks";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";

type Props = {
  type: string;
  onPress: (type: string) => void;
  showIcon?: boolean;
  isActive?: boolean;
  isDisabled?: boolean;
  isCredentialIssuancePending?: boolean;
  isRequested?: boolean;
  isSelectedCredential?: boolean;
  isUpcoming?: boolean;
  isNew?: boolean;
};

const credentialIconByType: Record<string, IOIcons> = {
  [CredentialType.DRIVING_LICENSE]: "car",
  [CredentialType.EUROPEAN_DISABILITY_CARD]: "accessibility",
  [CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD]: "healthCard",
  [CredentialType.EDUCATION_DEGREE]: "messageLegal",
  [CredentialType.EDUCATION_ENROLLMENT]: "messageLegal",
  [CredentialType.RESIDENCY]: "messageLegal"
};

const activeBadge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.active")
};

const activeL3Badge: Badge = {
  variant: "success",
  text: I18n.t("features.wallet.onboarding.badge.valid")
};

const disabledBadge: Badge = {
  variant: "default",
  text: I18n.t("features.wallet.onboarding.badge.unavailable")
};

const requestedBadge: Badge = {
  variant: "highlight",
  text: I18n.t("features.wallet.onboarding.badge.requested")
};

const upcomingBadge: Badge = {
  variant: "default",
  text: I18n.t("features.wallet.onboarding.badge.upcoming")
};

const newBadge: Badge = {
  variant: "default",
  text: I18n.t("features.wallet.onboarding.badge.new")
};

const getBadge = (args: {
  isActive?: boolean;
  isDisabled?: boolean;
  isRequested?: boolean;
  isUpcoming?: boolean;
  isNew?: boolean;
  isL3Enabled: boolean;
}): Badge | undefined => {
  const { isActive, isDisabled, isRequested, isUpcoming, isNew, isL3Enabled } =
    args;

  if (isActive) {
    return isL3Enabled ? activeL3Badge : activeBadge;
  }
  if (isDisabled) {
    return disabledBadge;
  }
  if (isRequested) {
    return requestedBadge;
  }
  if (isUpcoming) {
    return upcomingBadge;
  }
  if (isNew) {
    return newBadge;
  }
  return undefined;
};

const ItwOnboardingModuleCredential = ({
  type,
  onPress,
  showIcon = true,
  isActive,
  isDisabled,
  isUpcoming,
  isNew,
  isSelectedCredential,
  isCredentialIssuancePending,
  isRequested = false
}: Props) => {
  const isL3Enabled = useIOSelector(itwIsL3EnabledSelector);

  const badge = useMemo(
    () =>
      getBadge({
        isActive,
        isDisabled,
        isRequested,
        isUpcoming,
        isNew,
        isL3Enabled
      }),
    [isActive, isDisabled, isRequested, isUpcoming, isNew, isL3Enabled]
  );

  const handleOnPress = () => {
    onPress(type);
  };

  const isPressable = !(isActive || isDisabled);

  const baseProps = {
    testID: `${type}ModuleTestID`,
    label: getCredentialNameFromType(type),
    onPress: isPressable ? handleOnPress : undefined,
    isFetching: isCredentialIssuancePending && isSelectedCredential,
    badge
  };

  const icon = showIcon ? credentialIconByType[type] : undefined;

  return icon ? (
    <ModuleCredential {...baseProps} icon={icon as IOIcons} />
  ) : (
    <ModuleCredential {...baseProps} />
  );
};

const MemoizedComponent = memo(ItwOnboardingModuleCredential);
export { MemoizedComponent as ItwOnboardingModuleCredential };
