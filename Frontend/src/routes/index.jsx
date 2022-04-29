import React, {lazy, useEffect, useState} from 'react';
import {Route, Routes} from 'react-router-dom';

/**
 * Optional the component could load lazily, allowing to borrow more
 * time for it to completely load
 */
const Home = lazy(() => import('../components/screens/Home'));
const DashboardScreen = lazy(() => import('../components/screens/Dashboard/DashboardScreen'));
const ActivitiesScreen = lazy(() => import('../components/screens/Activities/ActivitiesScreen'));
const AddActivityScreen = lazy(() => import('../components/screens/Activities/AddActivity/AddActivityScreen'));
const WatchListsScreen = lazy(() => import('../components/screens/WatchLists/WatchListsScreen'));
const SettingsScreen = lazy(() => import('../components/screens/Settings/SettingsScreen'));
const AssetDetailsScreen = lazy(() => import('../components/screens/AssetDetails/AssetDetailsScreen'));
const AnalysisScreen = lazy(() => import('../components/screens/Analysis/AnalysisScreen'));

const emptyPortfolioData = {
  "Portfolio": {
    "name": "Portfolio",
    "value": 0,
    "gains": 0,
    "realisedGains": 0,
    "performance": 0,
    "shares": [],
    "crypto": [],
    "cash": [],
    "activities": [],
    "updated": "timestamp"
  },
};

/**
 * Get value from key in local storage
 * @param keyName
 * @param defaultValue
 * @returns {any|string}
 */
const persistState = (keyName, defaultValue) => {
  const savedData = localStorage.getItem(keyName);
  return !savedData ? defaultValue : JSON.parse(savedData);
};

/**
 * Get string from key in local storage
 * @param keyName
 * @param defaultValue
 * @returns {string}
 */
 const persistString = (keyName, defaultValue) => {
  const savedData = localStorage.getItem(keyName);
  return !savedData ? defaultValue : savedData;
};

/**
 * Defines the routes for the different pages
 * @constructor
 */
const AppRoutes = () => {
  const [watchListsArray, setWatchListsArray] = useState(() => persistState('watchListsArray', []));
  const [assetsListArray, setAssetsListArray] = useState(() => persistState('assetsListsArray', []));
  const [portfolioData, setPortfolioData] = useState(() => persistState('portfolioData', emptyPortfolioData));
  const [activePortfolio, setActivePortfolio] = useState(() => persistString('activePortfolio', 'Portfolio'));

  useEffect(() => {
    localStorage.setItem('watchListsArray', JSON.stringify(watchListsArray));
    localStorage.setItem('assetsListsArray', JSON.stringify(assetsListArray));
    localStorage.setItem('portfolioData', JSON.stringify(portfolioData));
    localStorage.setItem('activePortfolio', activePortfolio);
  }, [watchListsArray, assetsListArray, portfolioData, activePortfolio]);

  return (
    <Routes>
      <Route path='/' element={<Home/>}/>
      <Route 
        path='/dashboard' 
        element={
        <DashboardScreen
          activePortfolio={activePortfolio}
          setActivePortfolio={setActivePortfolio}
          portfolioData={portfolioData}
          setPortfolioData={setPortfolioData}
        />}
      />
      <Route 
        path='/analysis' 
        element={
        <AnalysisScreen
          
        />}
      />
      <Route 
        path='/activities' 
        element={
        <ActivitiesScreen
          activePortfolio={activePortfolio}
          portfolioData={portfolioData}
          setPortfolioData={setPortfolioData}
        />}
      />
      <Route 
        path='/activities/addActivity' 
        element={
        <AddActivityScreen
          activePortfolio={activePortfolio}
          portfolioData={portfolioData}
          setPortfolioData={setPortfolioData}
        />}
      />
      <Route
        path='/watchlists'
        element={
        <WatchListsScreen
          watchListsArray={watchListsArray}
          setWatchListsArray={setWatchListsArray}
          assetsListArray={assetsListArray}
          setAssetsListArray={setAssetsListArray}
          />
        }
      />
      <Route
        path='/settings'
        element={
        <SettingsScreen
          watchListsArray={watchListsArray}
          assetsListArray={assetsListArray}
          portfolioData={portfolioData}
        />}
      />
      <Route path='/asset/:asset' element={<AssetDetailsScreen/>}/>
    </Routes>
  );
}

export default AppRoutes;