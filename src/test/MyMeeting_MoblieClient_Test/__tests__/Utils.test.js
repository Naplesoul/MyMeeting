import React from 'react';
import { myFileType } from '../src/Constants';
import {
    validateEmail, 
    judgeFileType, 
    clearDupRoom,
    preventDoubleClick
} from '../src/utils/Utils';

describe('email sterotype validatar', () => {
    describe('given an invalid string', () => {
        test('no @ in the string', () => {
            const string = 'InvalidString.com';
            expect(validateEmail(string)).toBe(false);
        })
        test('dup @ in the string', () => {
            const string = 'Invalid@@String.com';
            expect(validateEmail(string)).toBe(false);
        })
        test('no domain name', () => {
            const string = 'Invalid@String.';
            expect(validateEmail(string)).toBe(false);
        })
        test('no host name', () => {
            const string = 'Invalid@.String';
            expect(validateEmail(string)).toBe(false);
        })
        test('no user name', () => {
            const string = '@InvalidString.com';
            expect(validateEmail(string)).toBe(false);
        })
        test('invalid character', () => {
            const string = '你好@InvalidString.com';
            expect(validateEmail(string)).toBe(false);
        })
    }) 
    describe('given a valid string', () => {
        test('valid string', () => {
            const string = 'Valid@String.com';
            expect(validateEmail(string)).toBe(true);
        })
    })
})

describe('file type judge', () => {
    test('types that have been listed', () => {
        expect(judgeFileType('pptx', 'file.ppt')).toBe(myFileType.ppt);
        expect(judgeFileType('image', 'file.jpg')).toBe(myFileType.image);
        expect(judgeFileType('text/plain', 'file.txt')).toBe(myFileType.text);
        expect(judgeFileType('application/pdf', 'file.pdf')).toBe(myFileType.pdf);
        expect(judgeFileType('docx', 'file.doc')).toBe(myFileType.word);
        expect(judgeFileType('xls', 'file.xls')).toBe(myFileType.excel);
        expect(judgeFileType('mp4', 'file.mp4')).toBe(myFileType.mp4);
    })
    test('types unknown', () => {
        expect(judgeFileType('file', 'file.xxx')).toBe(myFileType.unknown);
    })
})

describe('clear duplicate rooms', () => {
    const roomA = {
        id: 1,
        time: '2021-9-5'
    };
    const roomB = {
        id: 2,
        time: '2021-9-6'
    };
    const roomC = {
        id: 3,
        time: '2021-9-7'
    }

    const rightResult = [roomC, roomB, roomA];
    
    test('no duplicate rooms', () => {
        const roomArray = [roomA, roomB, roomC];
        expect(clearDupRoom(roomArray)).toStrictEqual(rightResult);
    })

    test('duplicate rooms', () => {
        const roomArray = [roomA, roomA, roomA, roomB, roomC, roomC];
        expect(clearDupRoom(roomArray)).toStrictEqual(rightResult);
    })
})

describe('prevent double click in a short  time interval', () => {
    const click = jest.fn(x => x++);

    test('click several times call once', () => {
        const calledInf = {
            isCalled: false,
        }

        for (let i = 0; i < 20; i++) {
            preventDoubleClick(click, calledInf);
        }

        expect(click.mock.calls.length).toBe(1);
    })

    test('click times equal to call times', async () => {
        const calledInf = {
            isCalled: false,
        }

        preventDoubleClick(click, calledInf);
        setTimeout(() => {
            preventDoubleClick(click, calledInf);
        }, 501)

        expect(click.mock.calls.length).toBe(2);
    })
})