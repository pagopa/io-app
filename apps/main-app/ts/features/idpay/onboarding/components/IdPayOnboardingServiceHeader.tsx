import {
  ContentWrapper,
  H1,
  IOImage,
  IOSkeleton,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
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
            alt={I18n.t("idpay.onboarding.initiativeImageAltText")}
            aspectRatio="4:3"
            imageProps={{
              source: { uri: thumbnailUrl }
            }}
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
    <IOSkeleton height={270} shape="rectangle" width="auto" />
    <ContentWrapper>
      <VSpacer size={24} />
      <IOSkeleton height={16} radius={4} shape="rectangle" width="80%" />
    </ContentWrapper>
  </VStack>
);

export { IdPayOnboardingServiceHeader };
