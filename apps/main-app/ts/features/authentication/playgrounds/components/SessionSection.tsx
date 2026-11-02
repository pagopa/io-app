import { ListItemHeader, ListItemInfo } from "@io-app/design-system";

import { useIOSelector } from "../../../../store/hooks";
import { spidLevelFromSessionInfoSelector } from "../../common/store/selectors";

export const SessionSection = () => {
  const authLevel = useIOSelector(spidLevelFromSessionInfoSelector);

  return (
    <>
      <ListItemHeader label="Session" />
      <ListItemInfo label="Authentication level" value={authLevel ?? "N/A"} />
    </>
  );
};
