import React, {useState, useEffect} from 'react'
import { AreaChartOutlined, BookOutlined, LayoutOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Affix, Button, Menu } from 'antd';
import Layout from 'antd/lib/layout/layout';
import Sider from 'antd/lib/layout/Sider';
import { useAuthUser, useSignOut } from 'react-auth-kit';
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import { MenuItem } from 'semantic-ui-react';
import { ListInvoicesSheet, ListReportsSheet } from '.';
import Dashboard from './Dashboard';
import ViewInvoiceSheet from './ViewInvoiceSheet';
import ViewReportSheet from './ViewReportSheet';


function getItem(label, key, icon, items) {
    return {
      key,
      icon,
      items,
      label,
    };
  }
  

  

export default () => {

    const navigate = useNavigate();
    const auth_user = useAuthUser();
    const signOutFunction = useSignOut();

    const [collapsed, setCollapsed] = useState(true);
    const [user, setUser] = useState({});


    const signOut = () => {
        signOutFunction();
        navigate("/");
    }

    const toggleSideBar = () => {
        setCollapsed(!collapsed);
    }

    // Check user permissions and display Sidebar menu accordingly.
    useEffect(() => {
        
        setUser(auth_user());
    }, [])
    


    return (
        <Layout style={{minHeight : '100vh'}}>
            <Affix> 
                <Menu className='menubar' theme="dark" style={{backgroundColor : "red !important"}} mode='horizontal'>

                    <Menu.Item onClick={signOut} style={{marginLeft : "auto"}} icon={<LogoutOutlined/>}>
                        Sign Out
                    </Menu.Item>
                    {/* <Menu.SubMenu style={{marginLeft : "auto"}} title={<Button icon={<LogoutOutlined />}>Sign Out</Button>}>
                    
                    </Menu.SubMenu> */}
                </Menu>
            </Affix>
            <Layout>
            <Sider trigger={null} onMouseEnter={toggleSideBar} onMouseLeave={toggleSideBar} collapsible collapsed={collapsed}>
                <Menu
                theme="dark"
                mode="inline"
                // items={items}
                >
                    <Menu.Item key={0}  icon={<AreaChartOutlined className='sidebar-icon' />}>
                        <Link to="/sheet">
                            {!collapsed && "Dashboard"}
                        </Link>
                    </Menu.Item>
                    <Menu.Item key={1}  icon={<LayoutOutlined className='sidebar-icon' />}>
                        <Link to="/sheet/invoice/list">
                            {!collapsed && "Access Invoices"}
                        </Link>
                    </Menu.Item>
                    {(user.permissions && user.permissions.access_reports) || true && 
                        <Menu.Item key={2}  icon={<BookOutlined className='sidebar-icon' />}>
                            <Link to="/sheet/report/list">
                                {!collapsed && "Check Reports"}
                            </Link>
                        </Menu.Item>
                    }
                    {user.isAdmin || true && 
                        <Menu.Item key={3}  icon={<UserOutlined className='sidebar-icon' />}>
                            <Link to="/sheet/users/list">
                                {!collapsed && "Manage Users"}
                            </Link>
                        </Menu.Item>
                    }
                </Menu>
            </Sider>
            <Layout>
            <Routes>
                <Route path="" element={<Dashboard/>} />
                <Route path="invoice/list" element={<ListInvoicesSheet/>} />
                <Route path="invoice/view/:invoice_id" element={<ViewInvoiceSheet/>} />
                <Route path="report/list" element={<ListReportsSheet/>} />
                <Route path="report/view/:report_id" element={<ViewReportSheet/>} />
            </Routes>
            </Layout>
            </Layout>
            
        </Layout>
    )
}
