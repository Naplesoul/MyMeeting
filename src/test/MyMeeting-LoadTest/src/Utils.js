import axios from "axios";
import {config} from "./Constants";


const instance = axios.create({
    baseURL: config.baseURL,
    timeout: 1000,
});


export const postRequest = async (url, data) => {
    try {
        return await instance.post(url, data);
    } catch (e) {
        if (e.response)
            return e.response;
        else {
            console.log(e)
            return null;
        }
    }
}

export const postFormData = async (url, data, config) => {
    try {
        return await instance.post(url, data, config);
    } catch (e) {
        if (e.response)
            return e.response;
        else {
            console.log(e)
            return null;
        }
    }
}

export const getRequest = async (url) => {
    try {
        return await instance.get(url);
    } catch (e) {
        if (e.response)
            return e.response;
        else {
            console.log(e)
            return null;
        }
    }
}
