import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";

type Props = {
  contentTitle: string;
};

export const SendAARLoadingComponent = ({ contentTitle }: Props) => (
  <LoadingScreenContent
    contentTitle={contentTitle}
    testID="LoadingScreenContent"
  />
);
