import {
  Body,
  ListItemHeader,
  ListItemSwitch,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { Canvas } from "@shopify/react-native-skia";
import I18n from "i18next";
import { useState } from "react";
import { Alert, useWindowDimensions, View } from "react-native";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { DSComponentViewerBox } from "../../../design-system/components/DSComponentViewerBox";
import { ItwBrandedBox } from "../../common/components/ItwBrandedBox";
import { ItwBrandedSkiaGradient } from "../../common/components/ItwBrandedSkiaGradient";
import { ItwEngagementBanner } from "../../common/components/ItwEngagementBanner";
import { ItwSkeumorphicCard } from "../../common/components/ItwSkeumorphicCard";
import { FlipGestureDetector } from "../../common/components/ItwSkeumorphicCard/FlipGestureDetector";
import { getCredentialStatusObject } from "../../common/utils/itwCredentialStatusUtils";
import {
  CredentialType,
  ItwStoredCredentialsMocks
} from "../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../common/utils/itwTypesUtils";
import { ItwRequestedClaimsList } from "../../issuance/components/ItwRequestedClaimsList";
import { ITW_ROUTES } from "../../navigation/routes";
import { ItwClaimsSelector } from "../../presentation/common/components/ItwClaimsSelector";
import { ItwPresentationCredentialCardFlipButton } from "../../presentation/details/components/ItwPresentationCredentialCardFlipButton";

const ItwWalletBrandSection = () => {
  const { width } = useWindowDimensions();
  const marginHorizontal = 24;
  return (
    <View
      style={{
        marginHorizontal: -marginHorizontal,
        paddingHorizontal: marginHorizontal,
        paddingBottom: 24
      }}
    >
      <ListItemHeader label="IT-Wallet Gradient" />
      <VStack space={8}>
        {["default", "warning", "error"].map(variant => (
          <DSComponentViewerBox
            key={`itwallet-gradient-${variant}`}
            name={variant}
          >
            <Canvas
              key={variant}
              style={{ width: width - marginHorizontal * 2, height: 50 }}
            >
              <ItwBrandedSkiaGradient
                width={width - marginHorizontal * 2}
                height={50}
                variant={variant as any}
              />
            </Canvas>
          </DSComponentViewerBox>
        ))}
      </VStack>
      <ListItemHeader label="IT-Wallet Box" />
      <VStack space={8}>
        {["default", "warning", "error"].map(variant => (
          <DSComponentViewerBox key={`itwallet-box-${variant}`} name={variant}>
            <ItwBrandedBox variant={variant as any}>
              <Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua
              </Body>
            </ItwBrandedBox>
          </DSComponentViewerBox>
        ))}
      </VStack>
    </View>
  );
};

const ItwEngagementBannerSection = () => (
  <View
    style={{
      marginHorizontal: -24,
      paddingHorizontal: 24,
      paddingBottom: 24
    }}
  >
    <ListItemHeader label="IT-Wallet Engagement Banner" />
    <VStack space={8}>
      <DSComponentViewerBox name={"default"}>
        <ItwEngagementBanner
          title={"Porta su IO i tuoi documenti digitali"}
          description={
            "Con piena validità ufficiale, digitali e sempre a portata di mano!"
          }
          action={"Aggiungi un documento"}
          onPress={() => Alert.alert("✅ Engagement Banner pressed")}
          onDismiss={() => Alert.alert("❌ Engagement Banner dismissed")}
          dismissable={true}
        />
      </DSComponentViewerBox>
      <DSComponentViewerBox name={"link"}>
        <ItwEngagementBanner
          title={"Dimostra chi sei col tuo dispositivo"}
          description={
            "Usa la tua Patente digitale anche come documento di riconoscimento, in modo facile e sicuro!"
          }
          action={"Inizia"}
          onPress={() => Alert.alert("✅ Engagement Banner pressed")}
          onDismiss={() => Alert.alert("❌ Engagement Banner dismissed")}
          dismissable={true}
        />
      </DSComponentViewerBox>
    </VStack>
  </View>
);

const ItwSkeumorphicCredentialSection = () => {
  const [valuesHidden, setValuesHidden] = useState(false);

  const credentialsWithCard: ReadonlyArray<string> = [
    "mDL",
    "EuropeanDisabilityCard"
  ];

  const L2Credentials = Object.entries(ItwStoredCredentialsMocks)
    .filter(([key]) => key !== "L3")
    .map(([_, value]) => value as CredentialMetadata)
    .filter(({ credentialType }) =>
      credentialsWithCard.includes(credentialType)
    );
  return (
    <View>
      <ListItemHeader label="Skeumorphic credential card" />
      <ListItemSwitch
        label="Hide claim values"
        value={valuesHidden}
        onSwitchValueChange={() => {
          setValuesHidden(!valuesHidden);
        }}
      />
      <VStack space={16}>
        {L2Credentials.map(l2Credential => (
          <ItwSkeumorphicCredentialItem
            key={l2Credential.credentialType}
            credential={l2Credential}
            valuesHidden={valuesHidden}
          />
        ))}
      </VStack>
    </View>
  );
};

const ItwSkeumorphicCredentialItem = ({
  credential,
  valuesHidden
}: {
  credential: CredentialMetadata;
  valuesHidden: boolean;
}) => {
  const navigation = useIONavigation();
  const [isFlipped, setFlipped] = useState(false);
  const { status = "valid" } = getCredentialStatusObject(credential);

  const handleOnPress = () => {
    navigation.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.PRESENTATION.CREDENTIAL_CARD_MODAL,
      params: {
        credential,
        status
      }
    });
  };

  return (
    <VStack key={credential.credentialType} space={16}>
      <FlipGestureDetector isFlipped={isFlipped} setIsFlipped={setFlipped}>
        <ItwSkeumorphicCard
          credential={credential}
          status={status}
          isFlipped={isFlipped}
          onPress={handleOnPress}
          valuesHidden={valuesHidden}
        />
      </FlipGestureDetector>
      <ItwPresentationCredentialCardFlipButton
        isFlipped={isFlipped}
        handleOnPress={() => setFlipped(_ => !_)}
      />
    </VStack>
  );
};

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

const claimsSelectorItems: Array<{
  id: string;
  label: string;
  value: unknown;
}> = [
  { id: "given_name", label: "Nome", value: "Mario" },
  { id: "family_name", label: "Cognome", value: "Rossi" },
  { id: "birth_date", label: "Data di nascita", value: "1990-03-15" },
  {
    id: "place_of_birth",
    label: "Luogo di nascita",
    value: { country: "IT", locality: "Roma" }
  },
  {
    id: "portrait",
    label: "Foto",
    value:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  },
  { id: "is_over_18", label: "Maggiorenne", value: true },
  { id: "is_over_65", label: "Over 65", value: false },
  { id: "nationalities", label: "Nazionalità", value: ["IT", "FR", "DE"] },
  {
    id: "driving_privileges",
    label: "Categorie patente",
    value: [
      {
        vehicle_category_code: "AM",
        issue_date: "2015-06-01",
        expiry_date: "2030-06-01"
      },
      {
        vehicle_category_code: "B",
        issue_date: "2018-09-15",
        expiry_date: "2028-09-15"
      }
    ]
  },
  {
    id: "address",
    label: "Indirizzo",
    value: {
      street: { value: "Via Roma 42", name: "Via" },
      city: { value: "Milano", name: "Città" },
      postal_code: { value: "20100", name: "CAP" }
    }
  },
  {
    id: "long_value",
    label: "Campo con valore molto lungo per testare il wrapping del testo",
    value:
      "Questo è un valore particolarmente lungo che serve a verificare il comportamento del componente quando il contenuto testuale eccede le dimensioni normali della cella"
  },
  { id: "empty_value", label: "Campo vuoto", value: "" }
];

const claimsSelectorCredentialTypes: Array<string> = [
  CredentialType.PID,
  CredentialType.DRIVING_LICENSE,
  CredentialType.EUROPEAN_DISABILITY_CARD,
  CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
  CredentialType.PROOF_OF_AGE,
  CredentialType.EDUCATION_ATTENDANCE,
  CredentialType.EDUCATION_DEGREE,
  CredentialType.EDUCATION_DIPLOMA,
  CredentialType.EDUCATION_ENROLLMENT,
  CredentialType.RESIDENCY,
  "Unknown Credential",
  "Unknown Credential Type with Ridicolously Long Long Long Long Name"
];

const ItwClaimsSelectorSection = () => (
  <VStack space={8}>
    <ListItemHeader label="ClaimsSelector" />
    {claimsSelectorCredentialTypes.map(credentialType => (
      <ItwClaimsSelector
        credentialType={credentialType}
        key={credentialType}
        items={claimsSelectorItems}
        defaultExpanded={false}
        selectionEnabled={false}
      />
    ))}
  </VStack>
);

export const ItwComponentsSection = () => (
  <>
    <ItwWalletBrandSection />
    <ItwEngagementBannerSection />
    <ItwSkeumorphicCredentialSection />
    <ItwClaimsListSection />
    <ItwClaimsSelectorSection />
  </>
);
