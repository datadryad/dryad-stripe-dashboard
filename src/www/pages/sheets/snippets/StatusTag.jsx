import { Tag } from 'antd';
import React, { Component } from 'react'


const StatusTag = ({status}) => {
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

    return (
        <Tag color={color}>{status.toUpperCase()}</Tag>
    )
}

export default StatusTag;