import React from 'react';
import {useParams} from 'react-router-dom';
import ScreensTemplate from '../../ScreensTemplate';
import PropTypes from 'prop-types';

const AssetDetailsScreen = props => {
  let {asset, assetType} = useParams();

  //data that we saved for this asset --> undefined if asset is not in the portfolio
  const savedAssetData = asset === undefined ? undefined : props.portfolioData[props.activePortfolio][assetType === "Crypto" ? "crypto" : "shares"].find(element => element.symbol === asset);

  const renderBody = () => (
    <h1>Details of asset: {asset}</h1>
  );

  return (
    <React.Fragment>
      <ScreensTemplate
        bodyComponent={renderBody}
        selectedNavLinkIndex={-1}
        assetsListArray={props.assetsListArray}
        searchResult={props.searchResult}
        setSearchResult={props.setSearchResult}
      />
    </React.Fragment>
  );
}

AssetDetailsScreen.propTypes = {
  searchResult: PropTypes.array,
  setSearchResult: PropTypes.func,
  portfolioData: PropTypes.object,
  activePortfolio: PropTypes.string,
  watchListsArray: PropTypes.array,
  assetsListArray: PropTypes.array,
};

export default AssetDetailsScreen;
