import { shallow } from 'enzyme';
import 'jsdom-global/register';
import React from 'react';
import { DefaultPic } from '../../src/components/DefaultPic';
import toJson from 'enzyme-to-json';

//DefaultPic, MyPic, DefaultWithAudioPic are similar components, so only test DefaultPic
describe('default picture of peer', () => {
    const normalStyle = {
        width: 300,
        height: 800,
    }

    test('with no avatar', () => {
        const wrapper = shallow(<DefaultPic style={normalStyle} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('with avatar', () => {
        const wrapper = shallow(<DefaultPic style={normalStyle} imgSrc={'testUri.jpg'} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('given width smaller than height', () => {
        const testStyle = {
            width: 200,
            height: 300,
        }
        const wrapper = shallow(<DefaultPic style={testStyle} />);
        expect(toJson(wrapper)).toMatchSnapshot();
    })
})