import { ListItemInfo } from "@pagopa/io-app-design-system";
import { IOScrollViewActions } from "../../../../../components/ui/IOScrollView";
import { IOScrollViewWithListItems } from "../../../../../components/ui/IOScrollViewWithListItems";
import { useHeaderSecondLevel } from "../../../../../hooks/useHeaderSecondLevel";

type Props = {
  title: string;
  subtitle: string;
  listItems: Array<ListItemInfo>;
  listItemHeaderLabel: string;
  actions: IOScrollViewActions;
  onClose: () => void;
};

export const ItwPermissionsWizard = ({
  title,
  subtitle,
  listItems,
  actions,
  listItemHeaderLabel,
  onClose
}: Props) => {
  useHeaderSecondLevel({
    title: "",
    goBack: onClose
  });

  return (
    <IOScrollViewWithListItems
      title={title}
      subtitle={subtitle}
      listItemHeaderLabel={listItemHeaderLabel}
      renderItems={listItems}
      actions={actions}
    />
  );
};
