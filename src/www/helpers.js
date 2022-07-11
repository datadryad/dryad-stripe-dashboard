const { notification } = require('antd');
const { useAuthHeader } = require('react-auth-kit');

const axios = require('axios').default;

const API_URL = "http://localhost:4000";

const apiCall = (route, data, callback, token) => {

    axios.post(API_URL + route, data, (token ? { headers : { Authorization : token } } : {})).then(callback).catch(error => reportError(error));
}

const reportError = (axios_response) => {
    console.log(axios_response);
    if(!axios_response.response){
        notification['error']({
            message : "There was an error.",
            description : (axios_response.message ? axios_response.message : axios_response)
        })
    }
    const response = axios_response.response;
    notification['error']({
        message : "There was an error.",
        description : (response.data ? response.data.message : response.message ? response.message : response)
    })
}

const getDateObject = (seconds) => {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(seconds);
    return t;
}

module.exports = { apiCall, reportError, getDateObject }