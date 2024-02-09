
import { AppContainer } from 'react-hot-loader';
import React from 'react';
import { render } from 'react-dom';
import configureStore from './store';
import { Provider } from 'react-redux';
import "./sass/base.scss"
import ApplicationContainer from './containers/app/app-container';


const store = configureStore();

const component = () => {
        return(<AppContainer>
            <Provider store={store}>
                <ApplicationContainer />
            </Provider>
        </AppContainer>);
}

export default component;
