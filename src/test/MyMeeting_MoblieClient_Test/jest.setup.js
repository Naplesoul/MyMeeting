import React from 'react';
import {configure} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
configure({adapter: new Adapter()});

jest.mock('react-native-progress', () => {
    const View = require('react-native/Libraries/Components/View/View');
    return {
        Bar: View,
    }
})
jest.mock('react-native-file-viewer', () => {})