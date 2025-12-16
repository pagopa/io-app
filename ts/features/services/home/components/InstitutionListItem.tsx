import { ListItemNav } from "@pagopa/io-app-design-system";
import { memo } from "react";
import { Institution } from "../../../../../definitions/services/Institution";
import { getLogoForInstitution } from "../../common/utils";
import { getListItemAccessibilityLabelCount } from "../../../../utils/accessibility";

type InstitutionListItemProps = {
  count: number;
  index: number;
  institution: Institution;
  onPress: (institution: Institution) => void;
};

const InstitutionListItem = ({
  count,
  index,
  institution,
  onPress
}: InstitutionListItemProps) => {
  const accessibilityLabel = `${
    institution.name
  }${getListItemAccessibilityLabelCount(count, index)}`;

  return (
    <ListItemNav
      accessibilityLabel={accessibilityLabel}
      avatarProps={{
        logoUri: getLogoForInstitution(institution.fiscal_code)
      }}
      numberOfLines={2}
      onPress={() => onPress(institution)}
      value={institution.name}
    />
  );
};

const MemoizedInstitutionListItem = memo(InstitutionListItem);

export { MemoizedInstitutionListItem as InstitutionListItem };
