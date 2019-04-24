import * as pot from "italia-ts-commons/lib/pot";
import React, { ComponentProps } from "react";

import { SectionListData } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ProfileState } from "../../store/reducers/profile";
import { serviceContainsText } from "../../utils/services";
import ServiceSectionListComponent from "./ServiceSectionListComponent";

type OwnProps = {
  sectionsState: // tslint:disable-next-line: readonly-array
  Array<SectionListData<pot.Pot<ServicePublic, Error>>>;
  searchText: string;
  profile: ProfileState;
  onRefresh: () => void;
  navigateToServiceDetail: (service: ServicePublic) => void;
};

type Props = Pick<
  ComponentProps<typeof ServiceSectionListComponent>,
  "onRefresh"
> &
  OwnProps;

type State = {
  potFilteredServiceSectionsStates: pot.Pot<
    // tslint:disable-next-line: readonly-array
    Array<SectionListData<pot.Pot<ServicePublic, Error>>>,
    Error
  >;
};

/**
 * Filter only the services that match the searchText.
 */
const generateSectionsServicesStateMatchingSearchTextArrayAsync = (
  potServicesState: pot.Pot<
    // tslint:disable-next-line: readonly-array
    Array<SectionListData<pot.Pot<ServicePublic, Error>>>,
    Error
  >,
  searchText: string
  // tslint:disable-next-line: readonly-array
): Promise<Array<SectionListData<pot.Pot<ServicePublic, Error>>>> => {
  return new Promise(resolve => {
    const result = pot.getOrElse(
      pot.map(potServicesState, _ =>
        _.filter(sectionList =>
          sectionDataContainsText(sectionList, searchText)
        )
      ),
      []
    );

    resolve(result);
  });
};

function sectionDataContainsText(
  sectionListData: SectionListData<pot.Pot<ServicePublic, Error>>,
  searchText: string
) {
  const sectionData = sectionListData.data;
  return sectionData.map(potService =>
    pot.getOrElse(
      pot.map(potService, servicePublic =>
        // Search in service properties
        serviceContainsText(servicePublic, searchText)
      ),
      false
    )
  );
}

/**
 * A component to render a list of services that match a searchText.
 */
class ServicesSearch extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      potFilteredServiceSectionsStates: pot.none
    };
  }

  public async componentDidMount() {
    const { sectionsState, searchText } = this.props;
    const { potFilteredServiceSectionsStates } = this.state;

    // Set filtering status
    this.setState({
      potFilteredServiceSectionsStates: pot.toLoading(
        potFilteredServiceSectionsStates
      )
    });

    // Start filtering services
    const filteredServiceSectionsStates = await generateSectionsServicesStateMatchingSearchTextArrayAsync(
      pot.some(sectionsState),
      searchText
    );

    // Unset filtering status
    this.setState({
      potFilteredServiceSectionsStates: pot.some(filteredServiceSectionsStates)
    });
  }

  public async componentDidUpdate(prevProps: Props) {
    const {
      sectionsState: prevServicesState,
      searchText: prevSearchText
    } = prevProps;
    const { sectionsState, searchText } = this.props;
    const { potFilteredServiceSectionsStates } = this.state;

    if (sectionsState !== prevServicesState || searchText !== prevSearchText) {
      // Set filtering status
      this.setState({
        potFilteredServiceSectionsStates: pot.toLoading(
          potFilteredServiceSectionsStates
        )
      });

      // Start filtering services
      const filteredServiceSectionsStates = await generateSectionsServicesStateMatchingSearchTextArrayAsync(
        pot.some(sectionsState),
        searchText
      );

      // Unset filtering status
      this.setState({
        potFilteredServiceSectionsStates: pot.some(
          filteredServiceSectionsStates
        )
      });
    }
  }

  public render() {
    const { potFilteredServiceSectionsStates } = this.state;
    const { onRefresh } = this.props;

    const isFiltering = pot.isLoading(potFilteredServiceSectionsStates);

    const filteredServiceSectionsStates = pot.getOrElse(
      potFilteredServiceSectionsStates,
      []
    );

    return (
      <ServiceSectionListComponent
        {...this.props}
        sections={filteredServiceSectionsStates}
        profile={this.props.profile}
        refreshing={isFiltering}
        onRefresh={onRefresh}
        onSelect={this.handleOnServiceSelect}
      />
    );
  }

  private handleOnServiceSelect = (service: ServicePublic) => {
    this.props.navigateToServiceDetail(service);
  };
}

export default ServicesSearch;
