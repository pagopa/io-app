import { Divider, useIOThemeContext } from "@pagopa/io-app-design-system";
import { Fragment } from "react";
import { ItwCredentialClaimsCard } from "../../../../common/components/ItwCredentialClaimsCard";
import { getCredentialCardConfig } from "../../../../common/components/ItwCredentialCard/config";
import { ClaimDisplayFormat } from "../../../../common/utils/itwClaimsUtils";
import { getCredentialNameFromType } from "../../../../common/utils/itwCredentialUtils";
import { useClaimsDetailsBottomSheet } from "../../hooks/useClaimsDetailsBottomSheet";
import { ClaimItem } from "./ClaimItem";

type Props = {
  /**
   * Credential type to display as title of the accordion
   */
  credentialType: string;
  /**
   * The list of items to display within the accordion.
   */
  items: Array<ClaimDisplayFormat>;
  /**
   * Enable the selection of items with a checkbox.
   * @default false
   */
  selectionEnabled?: boolean;
  /**
   * The IDs of the selected items, when the component is controlled.
   */
  selectedItemIds?: Array<string>;
  /**
   * Whether the accordion starts expanded.
   * @default false
   */
  defaultExpanded?: boolean;
  /**
   * Function called when a item is selected.
   */
  onItemSelected?: (item: ClaimDisplayFormat, selected: boolean) => void;
  /**
   * Function called when the accordion is toggled to collapsed or expanded state.
   */
  onToggle?: (expanded: boolean) => void;
  /**
   * Accessibilty
   */
  accessibilityLabel?: string;
};

export const ItwClaimsSelector = ({
  credentialType,
  items,
  defaultExpanded,
  onItemSelected,
  onToggle,
  accessibilityLabel,
  selectedItemIds,
  selectionEnabled = false
}: Props) => {
  const { themeType } = useIOThemeContext();
  const { present, bottomSheet } = useClaimsDetailsBottomSheet();

  const title = getCredentialNameFromType(credentialType);
  const { background } = getCredentialCardConfig(credentialType, themeType);

  return (
    <ItwCredentialClaimsCard
      collapsible
      title={title}
      headerGradientColor={background.colors[0]}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
      accessibilityLabel={accessibilityLabel}
      footer={bottomSheet}
    >
      {items.map((item, index) => (
        <Fragment key={item.id}>
          {index !== 0 && <Divider />}
          <ClaimItem
            item={item}
            selectionEnabled={selectionEnabled}
            isSelected={selectedItemIds?.includes(item.id)}
            onItemSelected={onItemSelected}
            present={present}
          />
        </Fragment>
      ))}
    </ItwCredentialClaimsCard>
  );
};
