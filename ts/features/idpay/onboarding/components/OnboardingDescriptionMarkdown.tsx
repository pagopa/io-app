import * as React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { VSpacer } from "../../../../components/core/spacer/Spacer";
import Markdown from "../../../../components/ui/Markdown";

type Props = {
  description: string;
  onLoadEnd: () => void;
};

const OnboardingDescriptionMarkdown = (props: Props) => {
  const { description, onLoadEnd } = props;

  const [isLoaded, setLoaded] = React.useState(false);

  const handleOnLoadEnd = () => {
    // The markdown component has a different height for some istants after finishing loading
    // Setting a timeout allows to properly display other components once the Markdown has finished
    // loading.
    setTimeout(() => {
      setLoaded(true);
      onLoadEnd();
    }, 300);
  };

  if (description.length > 0) {
    return (
      <View style={{ flexGrow: 1 }}>
        {!isLoaded && <OnboardingDescriptionMarkdownSkeleton />}
        <Markdown onLoadEnd={handleOnLoadEnd}>{description}</Markdown>
      </View>
    );
  }

  return <View style={{ flexGrow: 1 }} />;
};

const OnboardingDescriptionMarkdownSkeleton = () => (
  <>
    {Array.from({ length: 30 }).map((_, i) => (
      <View key={i}>
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"100%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
        <Placeholder.Box
          width={"90%"}
          animate={"fade"}
          height={21}
          radius={4}
        />
        <VSpacer size={8} />
      </View>
    ))}
  </>
);

export { OnboardingDescriptionMarkdown, OnboardingDescriptionMarkdownSkeleton };
