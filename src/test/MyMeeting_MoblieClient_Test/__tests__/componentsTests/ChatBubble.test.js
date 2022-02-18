import 'jsdom-global/register';
import React from 'react';
import { shallow, mount } from 'enzyme';
import {ChatBubble, FileBubble} from '../../src/components/ChatBubble';
import toJson from 'enzyme-to-json';
import { FileJobStatus, FileJobType } from '../../src/utils/Types';

describe('chatbubble render', () => {
    test('my information', () => {
        const wrapper = shallow(<ChatBubble text={'chat'} myInf={true} maxWidth={100} time={"2021-09-05T17:02:02+08:00"} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })
    test('peer information', ()=> {
        const wrapper = shallow(<ChatBubble text={'chat'} myInf={false} maxWidth={100} time={"2021-09-05T17:02:02+08:00"} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })
})

describe('filebubble render', () => {
    const downloadFileMock = jest.fn((file) => {
        file.fileJobStatus = FileJobStatus.progressing;
        file.bytesSent = 50;
        setTimeout(() => {
            file.fileJobStatus = FileJobStatus.completed;
            file.bytesSent = 99;
        }, 500)
    });

    let file;

    beforeEach(() => {
        file = {
            fileType: 'text/plain',
            filename: 'textFile',
            filePath: 'filepath',
            fromMyself: false,
            timestamp: "2021-09-05T17:02:02+08:00",
            fileJobStatus: FileJobStatus.unDownloaded,
            bytesSent: 0,
            totalBytes: 100,
        }
    })

    test('basic use', () => {
        const wrapper = shallow(<FileBubble file={file} maxWidth={200} downloadFile={downloadFileMock} />)
        expect(toJson(wrapper)).toMatchSnapshot();
    })

    test('press to download or open', () => {
        const wrapper = mount(<FileBubble file={file} maxWidth={200} downloadFile={downloadFileMock} />)
        wrapper.find('TouchableOpacity').simulate('click');
        expect(file.fileJobStatus).toBe(FileJobStatus.progressing);
        setTimeout(() => {
            expect(file.fileJobStatus).toBe(FileJobStatus.completed);
        }, 600)
    })
})