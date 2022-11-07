/**
 * A component that renders a list of services that match a search text.
 * TODO: fix scroll: some items are displayed only if the keyboard is hidden
 *    https://www.pivotaltracker.com/story/show/168803731
 */

import * as pot from "@pagopa/ts-commons/lib/pot";
import React from "react";
import { SectionListData } from "react-native";
import { ServicePublic } from "../../../definitions/backend/ServicePublic";
import { ServicesSectionState } from "../../store/reducers/entities/services";
import { isDefined } from "../../utils/guards";
import { serviceContainsText } from "../../utils/services";
import { SearchNoResultMessage } from "../search/SearchNoResultMessage";
import ServicesSectionsList from "./ServicesSectionsList";

type OwnProps = {
  sectionsState: ReadonlyArray<ServicesSectionState>;
  searchText: string;
  onRefresh: () => void;
  navigateToServiceDetail: (service: ServicePublic) => void;
};

type Props = OwnProps;

type State = {
  potFilteredServiceSectionsStates: pot.Pot<
    ReadonlyArray<ServicesSectionState>,
    Error
  >;
};

/**
 * Filter only the services that match the searchText.
 */
const generateSectionsServicesStateMatchingSearchTextArrayAsync = (
  servicesState: ReadonlyArray<ServicesSectionState>,
  searchText: string
): Promise<ReadonlyArray<ServicesSectionState>> =>
  new Promise(resolve => {
    const result = servicesState
      .map(section =>
        filterSectionListDataMatchingSearchText(section, searchText)
      )
      .filter(isDefined);

    resolve(result);
  });

function filterSectionListDataMatchingSearchText(
  sectionListData: SectionListData<pot.Pot<ServicePublic, Error>>,
  searchText: string
) {
  const filteredData = sectionListData.data
    .map(potService =>
      pot.filter(potService, servicePublic =>
        // Search in service properties
        serviceContainsText(servicePublic, searchText)
      )
    )
    .filter(pot.isSome);

  const sectionListDataFiltered = {
    organizationName: sectionListData.organizationName,
    organizationFiscalCode: sectionListData.organizationFiscalCode,
    data: filteredData
  };
  return filteredData.length > 0 ? sectionListDataFiltered : null;
}

class ServicesSearch extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      potFilteredServiceSectionsStates: pot.noneLoading
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
    const filteredServiceSectionsStates =
      await generateSectionsServicesStateMatchingSearchTextArrayAsync(
        sectionsState,
        searchText
      );

    // Unset filtering status
    this.setState({
      potFilteredServiceSectionsStates: pot.some(filteredServiceSectionsStates)
    });
  }

  public async componentDidUpdate(prevProps: Props) {
    const { sectionsState: prevServicesState, searchText: prevSearchText } =
      prevProps;
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
      const filteredServiceSectionsStates =
        await generateSectionsServicesStateMatchingSearchTextArrayAsync(
          sectionsState,
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

    return filteredServiceSectionsStates.length > 0 ? (
      <ServicesSectionsList
        {...this.props}
        sections={filteredServiceSectionsStates}
        isRefreshing={isFiltering}
        onRefresh={onRefresh}
        onSelect={this.handleOnServiceSelect}
      />
    ) : (
      <SearchNoResultMessage errorType="NoResultsFound" />
    );
  }

  private handleOnServiceSelect = (service: ServicePublic) => {
    this.props.navigateToServiceDetail(service);
  };
}

export default ServicesSearch;
