import { notification } from 'antd';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';

export const API_URL = "http://localhost:4000";

export const apiCall = (route, data, callback, token, loadingCallbackState) => {

    axios.post(API_URL + route, data, (token ? { headers : { Authorization : token } } : {})).then(callback).catch(error => {reportError(error); if(loadingCallbackState) loadingCallbackState(false)});
}

export const reportError = (axios_response) => {
    console.log(axios_response);

    const notif = {
        message : "There was an error.",
    };
    if(!axios_response.response){

        if(axios_response.data){

        }
        notification['error']({
            message : "There was an error.",
            description : (axios_response.message ? axios_response.message : axios_response)
        })

        return;
    }
    const response = axios_response.response;

    if(response.data){
        console.log( typeof response.data.error);
        if(response.data.raw && response.data.raw.message) notif.description = response.data.raw.message;
        else if(response.data.error && response.data.error.message) notif.description = response.data.error.message;
        
        else if(typeof response.data.error === "string") notif.description = response.data.error;
        else if(Array.isArray(response.data.error)){
            response.data.error.forEach(element => {
                notif.description += element + '.'
            });
        }
        else if(response.message) notif.description = response.message;
    }
    notification['error'](notif);
}

export const getDateObject = (seconds) => {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(seconds);
    return t;
}

export const getStatusColor = (status) => {
    let color = false;
    switch (status) {
        case 'paid':
            color = 'green';
            break;
    
        case 'invoiced_in_error':
            color = 'volcano';
            break;
    
        case 'waiver':
            color = 'geekblue';
            break;
    
        case 'voucher':
            color = 'geekblue';
            break;
    
        case 'refund':
            color = 'orange';
            break;
    
        case 'uncollectible':
            color = 'magenta';
            break;
    
        case 'open':
            color = 'cyan';
            break;
    
        default:
            break;
    }
    
    return color;
}

export const printAmount = (invoice) => {
    return `${getSymbolFromCurrency(invoice.currency)}${Math.round(invoice.amount_due/100)}`;
}
