import React, { useState, useEffect } from 'react'
import { Button, Dropdown, Col, Space, Table, Row, Input, Switch, Collapse, notification } from "antd"
import { BranchesOutlined, DownOutlined, LayoutOutlined, RightCircleOutlined, RollbackOutlined, SafetyOutlined, SmileOutlined } from '@ant-design/icons';
import { apiCall, getDateObject, getStatusColor, printAmount, ReportError } from '../../helpers';
import { NavLink, useNavigate } from 'react-router-dom';
import StatusTag from './snippets/StatusTag';
import { useAuthHeader } from 'react-auth-kit';
import { Transfer, Tree } from 'antd';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

const { Search } = Input;

const isChecked = (selectedKeys, eventKey) => selectedKeys.includes(eventKey);

const generateTree = (treeNodes = [], checkedKeys = []) =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key),
    children: generateTree(children, checkedKeys),
}));

const TreeTransfer = ({ dataSource, targetKeys, ...restProps }) => {
    const transferDataSource = [];
  
    function flatten(list = []) {
      list.forEach((item) => {
        transferDataSource.push(item);
        flatten(item.children);
      });
    }
  
    flatten(dataSource);
    return (
      <Transfer
        {...restProps}
        targetKeys={targetKeys}
        dataSource={transferDataSource}
        className="tree-transfer"
        render={(item) => item.title}
        showSelectAll={false}
      >
        {({ direction, onItemSelect, selectedKeys }) => {
          if (direction === 'left') {
            const checkedKeys = [...selectedKeys, ...targetKeys];
            return (
              <Tree
                blockNode
                checkable
                checkStrictly
                defaultExpandAll
                checkedKeys={checkedKeys}
                treeData={generateTree(dataSource, targetKeys)}
                onCheck={(_, { node: { key } }) => {
                  onItemSelect(key, !isChecked(checkedKeys, key));
                }}
                onSelect={(_, { node: { key } }) => {
                  onItemSelect(key, !isChecked(checkedKeys, key));
                }}
              />
            );
          }
        }}
      </Transfer>
    );
  };

const TreeTransferComponent = ({user_id, current_permissions, permissions}) => {

    const authHeader = useAuthHeader();
    const navigate = useNavigate();


    const [targetKeys, setTargetKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [changed, setChanged] = useState(false);
    
    useEffect(() => {
        console.log(current_permissions);
        setTargetKeys(current_permissions);
      
    }, [])
    

    const onChange = (keys) => {
        console.log(keys);
        if(!changed) setChanged(true);
        setTargetKeys(keys);
    };

    const setPermissions = async () => {

        setLoading(true);

        const permissions_bundle = {
            invoice_permissions : {
                set_refund : false,
            set_to_be_refund : false,
            // Set permanent statuses.
            set_paid : false,
            set_invoiced_in_error : false,
            set_waiver : false,
            set_voucher : false,
            set_refund : false,
            set_uncollectible : false,
            // Set temporary statuses.
            set_to_be_paid : false,
            set_to_be_invoiced_in_error : false,
            set_to_be_waiver : false,
            set_to_be_voucher : false,
            set_to_be_refund : false,
            set_to_be_uncollectible : false,
            },
            report_permissions : {
                balance_summary_1 : false,
                balance_change_from_activity_summary_1 : false,
                balance_change_from_activity_itemized_3 : false,
                payouts_summary_1 : false,
                payouts_itemized_3 : false,
                payout_reconciliation_summary_1 : false,
                payout_reconciliation_itemized_5 : false,
                ending_balance_reconciliation_summary_1 : false,
            },
            general_permissions : {
                view_invoice : false,
                access_reports : false,
                manage_users : false
            }
        }

        targetKeys.forEach(allow_key => {
            for (const permission_type in permissions_bundle) {
    
                if (Object.hasOwnProperty.call(permissions_bundle, permission_type)) {
                    const permissions = permissions_bundle[permission_type];
                    
                    if(permissions.hasOwnProperty(allow_key)){
                        permissions[allow_key] = true;
                        break;
                    }
    
                }
            }
        })

        let update = {};

        for (const type in permissions_bundle) {
            if (Object.hasOwnProperty.call(permissions_bundle, type)) {
                const permissions = permissions_bundle[type];

                for (const permission in permissions) {
                    if (Object.hasOwnProperty.call(permissions, permission)) {
                        const allow_status = permissions[permission];
                        
                        update[`${type}.${permission}`] = `${allow_status}`
                    }
                }
            }
        }

        apiCall("/users/permit", {permission_updates : update, user_id}, (response) => {
            try {
                if(response.data.data && response.data.data.id){
                    notification['success']({
                        message : "User update action",
                        description : "Permissions updated successfully!"
                    });
                }
            } catch (error) {
                notification['error']({
                    message : "Error",
                    description : "Permissions could not be updated, try again later."
                })
                setTargetKeys(current_permissions);
            }
            setLoading(false);
        }, authHeader(), setLoading, navigate )
    }

    



    
    
    return (
        <>
            {/* <Space direction='vertical'> */}
            <TreeTransfer dataSource={permissions} targetKeys={targetKeys} onChange={onChange} />
            
            <div style={{display : "flex", justifyContent : 'flex-end', marginTop : "1em"}}>
            <Button disabled={!changed} type="primary" icon={<SafetyOutlined />} onClick={setPermissions} loading={loading} >Set Permissions</Button>
            </div>
            {/* </Space> */}
        </>
    )
}

const hdate = require("human-date");

const changeStatus = (new_status, invoice_id, auth_token, fetchInvoices, navigate) => {

    apiCall(`/invoices/update/${new_status}`, {invoice_id}, (response) => {
        if(response.status == 200) fetchInvoices();
        else{
            ReportError(response);
        }
    }, auth_token, null, navigate);
}



const ListUsersSheet =  () => {

    const authHeader = useAuthHeader();
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [param, setParam] = useState("");

    
    useEffect(() => {
      apiCall("/users/list", {}, (response) => {
        const users = response.data.data;

        setUsers(users);
      }, authHeader(), setLoading, navigate);
    
    }, [])
    


    const fetchUsers = (param) => {
        setLoading(true);
        setParam(param);
        
        apiCall("/auth/find", {param}, (r) => {
            console.log(r)
            let users = r.data;
            
            console.log("USERSSS", users);
            setLoading(false);
            setUsers(users);
        }, authHeader(), setLoading, navigate)
        
    }


    const toggleAccount = (isActive, user_id, Switch) => {
        
        apiCall("/auth/toggle", {user_id, status : !isActive}, (r) => {
            if(r.isActive !== isActive) fetchUsers(param);
        }, authHeader(), setLoading, navigate)
    }

    const names = (a) => {
        a = a.replace("set_to_be", "Mark_as");
        a = a.replace("set", "Set_status_to");
        a = a.replaceAll("_", " ").replace(/\d+$/, "");
        return a.toProperCase();
    }
    


    const columns = [
        // Offering
        {
            title : "Email",
            dataIndex : "email",
            key : "email"
        },
        {
            title : "Account status",
            dataIndex : "isActive",
            key : "isActive",
            render : (isActive, user) => {
                return (
                    <Switch checked={isActive} unCheckedChildren="Disabled" checkedChildren="enabled" onChange={() => toggleAccount(isActive, user.id)} />
                )
            }
        },
        {
            title : "Permissions",
            dataIndex : "permissions",
            key : "permissions",
            render : (permissions, user) => {

                const arr = [];
                const current = []
                const types = ["general_permissions", "invoice_permissions", "report_permissions"];
                types.forEach(permission_category => {
                    
                    const permission_group = {
                        title : permission_category.replaceAll("_", " ").toProperCase(),
                        value : permission_category,
                        checkable : false,
                        children : []

                    };

                    for (const key in user[permission_category]) {
                        if (Object.hasOwnProperty.call(user[permission_category], key)) {
                            const value = user[permission_category][key];
                            
                             permission_group.children.push({
                                title : names(key),
                                value : key,
                                key : key,
                            })
                            if(value === "true"){
                                current.push(key);
                            }
                            
                        }
                    }

                    arr.push(permission_group)
                });

                console.log(arr, current);
                return (
                    <Collapse >
                        <CollapsePanel key={1} header="Manage Permissions">
                            <TreeTransferComponent user_id={user.id} permissions={arr} current_permissions={current} />    
                        </CollapsePanel>
                    </Collapse>
                )
            }
        }

    ]
    
    
    return (
        <div className='sheet'>
            <Space/>
            <h2>Manage Users </h2>
            <Search 
                placeholder='Search for a User'
                onSearch={fetchUsers}
            />
            
            <Table pagination={false} loading={loading} dataSource={users} columns={columns} />
            
        </div>
    )
}

export default ListUsersSheet