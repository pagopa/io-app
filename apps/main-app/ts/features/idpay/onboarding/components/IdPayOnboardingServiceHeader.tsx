import { InitiativeDataDTO } from "@io-app/api-types/generated/definitions/idpay/InitiativeDataDTO";
import {
  ContentWrapper,
  H1,
  IOImage,
  IOSkeleton,
  VSpacer,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";

type Props = {
  initiative: InitiativeDataDTO | undefined;
};

const IdPayOnboardingServiceHeader = (props: Props) => {
  const { initiative } = props;

  return initiative ? (
    <VStack>
      <IOImage
        alt={I18n.t("idpay.onboarding.initiativeImageAltText")}
        aspectRatio="4:3"
        imageProps={{
          source: { uri: initiative.thumbnailUrl }
        }}
      />
      <ContentWrapper>
        <VSpacer size={24} />
        <H1>{initiative.initiativeName}</H1>
      </ContentWrapper>
    </VStack>
  ) : (
    <Skeleton />
  );
};

const Skeleton = () => (
  <VStack>
    <IOSkeleton height={270} shape="rectangle" width="auto" />
    <ContentWrapper>
      <VSpacer size={24} />
      <IOSkeleton height={16} radius={4} shape="rectangle" width="80%" />
    </ContentWrapper>
  </VStack>
);

export { IdPayOnboardingServiceHeader };
