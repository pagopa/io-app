import { ListItemHeader, useIOTheme } from "@pagopa/io-app-design-system";
import I18n from "i18next";
import { View } from "react-native";
import { ItwRequestedClaimsList } from "../../issuance/components/ItwRequestedClaimsList";

export const ItwClaimsListSection = () => {
  const theme = useIOTheme();

  const mock = [
    {
      claim: { id: "firstName", label: "First Name", value: "Mario" },
      source: "CIE"
    },
    {
      claim: { id: "lastName", label: "Last Name", value: "Rossi" },
      source: "CIE"
    },
    {
      claim: { id: "dateOfBirth", label: "Date of Birth", value: "1990-01-01" },
      source: "CIE"
    },
    {
      claim: { id: "email", label: "Email", value: "mario.rossi@email.com" },
      source: "SPID"
    }
  ];

  return (
    <View
      style={{
        marginHorizontal: -24,
        paddingHorizontal: 24,
        paddingBottom: 24
      }}
    >
      <ListItemHeader
        label={I18n.t(
          "features.itWallet.issuance.credentialAuth.requiredClaims"
        )}
        iconName="security"
        iconColor={theme["icon-default"]}
      />
      <ItwRequestedClaimsList items={mock} />
    </View>
  );
};
