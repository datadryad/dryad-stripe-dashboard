import { notification } from 'antd';
import getSymbolFromCurrency from 'currency-symbol-map';
import { useAuthHeader } from 'react-auth-kit';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSignOut } from 'react-auth-kit';


// export const API_URL = `${window.location.protocol}//${window.location.hostname}:${process.env.PORT || 4000}`;

// let backend_api_url = `${window.location.protocol}//${window.location.hostname}`;
// if(window.location.hostname == "localhost") backend_api_url += ":4000";

// export const API_URL = 'http://31.220.17.80:4000';
export const API_URL = 'http://localhost:4000';
export const apiCall = (route, data, callback, token, loadingCallbackState, navigate) => {
    axios.post(API_URL + route, data, (token ? { headers : { Authorization : token } } : {})).then(callback).catch(error => {ReportError(error, navigate); if(loadingCallbackState) loadingCallbackState(false)});
}

export const ReportError = (axios_response, navigate) => {

    let notif = {
        
    }
    
    console.log("CAUGHT API CALL ERROR : ", axios_response);
    

    notif = {
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
    if(axios_response.response.status === 403){
        notif.message = "Your Session has timed out.";
        notif.description = "Please sign in again to continue.";
        notification['error'](notif);

        navigate("/")

        return;
        
    }
    const response = axios_response.response;

    if(response.data){
        if(response.data.raw && response.data.raw.message) notif.description = response.data.raw.message;
        else if(response.data.error && response.data.error.message) notif.description = response.data.error.message;
        
        else if(typeof response.data.error === "string") notif.description = response.data.error;
        else if(Array.isArray(response.data.error)){
            response.data.error.forEach(element => {
                notif.description += element + '.'
            });
        }
        else if(response.data.message) notif.description = response.data.message;
        else if(response.message) notif.description = response.message;
    }

    if(!notif.description) notif.description = axios_response.response.statusText;
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

export const HaltIfNotPermitted = (event) => {

}

export const reportVerbose = (report_type) => {
    const dict = {
        "balance.summary.1" : "Balance - Summary",
        "balance_change_from_activity.summary.1" : "Balance change from activity - Summary",
        "balance_change_from_activity.itemized.3" : "Balance change from activity - Itemized",
        "payouts.summary.1" : "Payouts - Summary",
        "payouts.itemized.3" : "Payouts - Itemized",
        "payout_reconciliation.summary.1" : "Payout reconciliation - Summary",
        "payout_reconciliation.itemized.5" : "Payout reconciliation - Itemized",
        "ending_balance_reconciliation.summary.1" : "Ending balance reconciliation - Summary",
    }

    if(dict.hasOwnProperty(report_type)) return dict[report_type];

    report_type = report_type.replaceAll('.', ' ');
    report_type = report_type.replaceAll('_', ' ');

    return report_type;

}