import { Tag } from 'antd';
import React, { Component } from 'react'
import { getStatusColor } from '../../../helpers';


const StatusTag = ({status,faint}) => {

    return (
        <Tag style={{opacity : (faint ? '0.4' : '1')}} color={getStatusColor((status))}>{status ? status.toUpperCase() : "None"}</Tag>
    )
}

export default StatusTag;