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
  item: ClaimDisplayFormat;
  selectionEnabled: boolean;
  isSelected?: boolean;
  onItemSelected?: (item: ClaimDisplayFormat, selected: boolean) => void;
  present?: (claims: Array<ClaimDisplayFormat>, title?: string) => void;
};

/**
 * Builds the optional endElement info button that opens a bottom sheet with
 * claim details when pressed.
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
 * Renders a single claim item based on its display format. Handles text, image,
 * list, driving privileges, nested objects and nested object arrays following
 * the same rendering logic as the old `mapClaimsToClaimsSelectorItems`
 * utility.
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
    case "image":
      return (
        <ListItemInfo
          value={
            <Image
              source={{ uri: value }}
              style={styles.imageClaim}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          }
          label={description}
          accessibilityRole="image"
          reversed
        />
      );

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
                    value={privilege.driving_privilege}
                    description={description}
                    selected={isSelected}
                    onValueChange={
                      onItemSelected
                        ? selected => onItemSelected(item, selected)
                        : undefined
                    }
                  />
                ) : (
                  <ListItemInfo
                    value={privilege.driving_privilege}
                    label={description}
                    reversed
                    endElement={buildInfoEndElement(
                      present,
                      drivingPrivilegeToClaims(privilege),
                      title
                    )}
                  />
                )}
              </Fragment>
            );
          })}
        </>
      );

    case "nestedObject":
      // Nested objects are rendered inline at the same level as other claims
      return (
        <>
          {value.map((nestedClaim, idx) => (
            <Fragment key={`${nestedClaim.id}_${idx}`}>
              {idx > 0 && <Divider />}
              <ClaimItem
                item={nestedClaim}
                selectionEnabled={selectionEnabled}
                isSelected={isSelected}
                onItemSelected={onItemSelected}
                present={present}
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
                  item={nestedClaim}
                  selectionEnabled={selectionEnabled}
                  isSelected={isSelected}
                  onItemSelected={onItemSelected}
                  present={present}
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
                    value={summaryVal}
                    description={summaryDesc}
                    selected={isSelected}
                    onValueChange={
                      onItemSelected
                        ? selected => onItemSelected(item, selected)
                        : undefined
                    }
                  />
                ) : (
                  <ListItemInfo
                    value={summaryVal}
                    label={summaryDesc}
                    reversed
                    endElement={buildInfoEndElement(present, singleItemClaims)}
                  />
                )}
              </Fragment>
            );
          })}
        </>
      );
    }

    case "list":
      return selectionEnabled ? (
        <ListItemCheckbox
          value={value.map(getSafeText).join(", ")}
          description={description}
          selected={isSelected}
          onValueChange={
            onItemSelected
              ? selected => onItemSelected(item, selected)
              : undefined
          }
        />
      ) : (
        <ListItemInfo
          value={value.map(getSafeText).join(", ")}
          label={description}
          reversed
        />
      );

    case "text":
    default:
      return selectionEnabled ? (
        <ListItemCheckbox
          value={getSafeText(value)}
          description={description}
          selected={isSelected}
          onValueChange={
            onItemSelected
              ? selected => onItemSelected(item, selected)
              : undefined
          }
        />
      ) : (
        <ListItemInfo value={getSafeText(value)} label={description} reversed />
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
