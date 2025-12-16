import {
  ContentWrapper,
  H1,
  IOImage,
  IOSkeleton,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import I18n from "i18next";
import { InitiativeDataDTO } from "../../../../../definitions/idpay/InitiativeDataDTO";

type Props = {
  initiative: O.Option<InitiativeDataDTO>;
};

const IdPayOnboardingServiceHeader = (props: Props) => {
  const { initiative } = props;

  return pipe(
    initiative,
    O.map(initiativeDetails => ({
      organizationName: initiativeDetails.organizationName,
      initiativeName: initiativeDetails.initiativeName,
      thumbnailUrl: initiativeDetails.thumbnailUrl
    })),
    O.fold(
      () => <Skeleton />,
      ({ initiativeName, thumbnailUrl }) => (
        <VStack>
          <IOImage
            imageProps={{
              source: { uri: thumbnailUrl }
            }}
            alt={I18n.t("idpay.onboarding.initiativeImageAltText")}
            aspectRatio="4:3"
          />
          <ContentWrapper>
            <VSpacer size={24} />
            <H1>{initiativeName}</H1>
          </ContentWrapper>
        </VStack>
      )
    )
  );
};

const Skeleton = () => (
  <VStack>
    <IOSkeleton shape="rectangle" height={270} width="auto" />
    <ContentWrapper>
      <VSpacer size={24} />
      <IOSkeleton shape="rectangle" width="80%" height={16} radius={4} />
    </ContentWrapper>
  </VStack>
);

export { IdPayOnboardingServiceHeader };
