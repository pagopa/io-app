import LoadingScreenContent from "../../../../components/screens/LoadingScreenContent";

type Props = {
  contentTitle: string;
};

export const SendAARLoadingComponent = ({ contentTitle }: Props) => (
  <LoadingScreenContent title={contentTitle} testID="LoadingScreenContent" />
);
