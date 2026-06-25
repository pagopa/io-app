import {
  Divider,
  ListItemCheckbox,
  ListItemInfo
} from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { Fragment } from "react";
import { Image, StyleSheet } from "react-native";

import { getNestedItemSummary } from "../../../../common/components/ItwCredentialMultiClaim";
import {
  ClaimDisplayFormat,
  drivingPrivilegeToClaims,
  getClaimDisplayValue,
  getSafeText
} from "../../../../common/utils/itwClaimsUtils";

type Props = {
  isSelected?: boolean;
  item: ClaimDisplayFormat;
  onItemSelected?: (item: ClaimDisplayFormat, selected: boolean) => void;
  present?: (claims: Array<ClaimDisplayFormat>, title?: string) => void;
  selectionEnabled: boolean;
};

/**
 * Builds the optional endElement info button that opens a bottom sheet
 * with claim details when pressed.
 */
const buildInfoEndElement = (
  present: Props["present"],
  claims: Array<ClaimDisplayFormat>,
  title?: string
): ListItemInfo["endElement"] => {
  if (!present) {
    return undefined;
  }

  return {
    type: "iconButton",
    componentProps: {
      icon: "info",
      accessibilityLabel: title ?? I18n.t("global.buttons.show"),
      onPress: () => present(claims, title)
    }
  };
};

/**
 * Renders a single claim item based on its display format.
 * Handles text, image, list, driving privileges, nested objects and
 * nested object arrays following the same rendering logic as the
 * old `mapClaimsToClaimsSelectorItems` utility.
 */
export const ClaimItem = ({
  item,
  selectionEnabled,
  isSelected,
  onItemSelected,
  present
}: Props) => {
  const { renderAs, value } = getClaimDisplayValue(item);
  const { label: description, id } = item;

  switch (renderAs) {
    case "drivingPrivileges":
      return (
        <>
          {value.map((privilege, idx) => {
            const privilegeId = `${idx}_${description}_${privilege.driving_privilege}`;
            const title = I18n.t(
              "features.itWallet.verifiableCredentials.claims.mdl.category",
              { category: privilege.driving_privilege }
            );
            return (
              <Fragment key={privilegeId}>
                {idx > 0 && <Divider />}
                {selectionEnabled ? (
                  <ListItemCheckbox
                    description={description}
                    onValueChange={
                      onItemSelected
                        ? selected => onItemSelected(item, selected)
                        : undefined
                    }
                    selected={isSelected}
                    value={privilege.driving_privilege}
                  />
                ) : (
                  <ListItemInfo
                    endElement={buildInfoEndElement(
                      present,
                      drivingPrivilegeToClaims(privilege),
                      title
                    )}
                    label={description}
                    reversed
                    value={privilege.driving_privilege}
                  />
                )}
              </Fragment>
            );
          })}
        </>
      );

    case "image":
      return (
        <ListItemInfo
          accessibilityRole="image"
          label={description}
          reversed
          value={
            <Image
              accessibilityIgnoresInvertColors
              resizeMode="contain"
              source={{ uri: value }}
              style={styles.imageClaim}
            />
          }
        />
      );

    case "list":
      return selectionEnabled ? (
        <ListItemCheckbox
          description={description}
          onValueChange={
            onItemSelected
              ? selected => onItemSelected(item, selected)
              : undefined
          }
          selected={isSelected}
          value={value.map(getSafeText).join(", ")}
        />
      ) : (
        <ListItemInfo
          label={description}
          reversed
          value={value.map(getSafeText).join(", ")}
        />
      );

    case "nestedObject":
      // Nested objects are rendered inline at the same level as other claims
      return (
        <>
          {value.map((nestedClaim, idx) => (
            <Fragment key={`${nestedClaim.id}_${idx}`}>
              {idx > 0 && <Divider />}
              <ClaimItem
                isSelected={isSelected}
                item={nestedClaim}
                onItemSelected={onItemSelected}
                present={present}
                selectionEnabled={selectionEnabled}
              />
            </Fragment>
          ))}
        </>
      );

    case "nestedObjectArray": {
      const nestedClaimItems = value;

      if (nestedClaimItems.length === 1) {
        // Single nested object: render inline without detail action
        return (
          <>
            {nestedClaimItems[0].map((nestedClaim, idx) => (
              <Fragment key={`${nestedClaim.id}_${idx}`}>
                {idx > 0 && <Divider />}
                <ClaimItem
                  isSelected={isSelected}
                  item={nestedClaim}
                  onItemSelected={onItemSelected}
                  present={present}
                  selectionEnabled={selectionEnabled}
                />
              </Fragment>
            ))}
          </>
        );
      }

      // Multiple nested objects: render summary rows with info buttons
      return (
        <>
          {nestedClaimItems.map((singleItemClaims, index) => {
            const { summaryLabel, summaryValue } = getNestedItemSummary(
              id,
              singleItemClaims
            );

            const summaryDesc = getSafeText(summaryLabel ?? "");
            const summaryVal = getSafeText(summaryValue ?? "");

            return (
              <Fragment key={`${index}_${id}_${description}`}>
                {index > 0 && <Divider />}
                {selectionEnabled ? (
                  <ListItemCheckbox
                    description={summaryDesc}
                    onValueChange={
                      onItemSelected
                        ? selected => onItemSelected(item, selected)
                        : undefined
                    }
                    selected={isSelected}
                    value={summaryVal}
                  />
                ) : (
                  <ListItemInfo
                    endElement={buildInfoEndElement(present, singleItemClaims)}
                    label={summaryDesc}
                    reversed
                    value={summaryVal}
                  />
                )}
              </Fragment>
            );
          })}
        </>
      );
    }

    case "text":
    default:
      return selectionEnabled ? (
        <ListItemCheckbox
          description={description}
          onValueChange={
            onItemSelected
              ? selected => onItemSelected(item, selected)
              : undefined
          }
          selected={isSelected}
          value={getSafeText(value)}
        />
      ) : (
        <ListItemInfo label={description} reversed value={getSafeText(value)} />
      );
  }
};

const styles = StyleSheet.create({
  imageClaim: {
    width: 150,
    height: 200,
    borderRadius: 8
  }
});
