MyMeeting_MobileClient

To run the app:
after npm install, move '@flyerhq' and 'react-native-speech-iflytek' into node_modules to overwrite the previous one

test:
```
 import 'jsdom-global/register';
 import {configure} from 'enzyme';
 import Adapter from 'enzyme-adapter-react-16';
 configure({adapter: new Adapter()});