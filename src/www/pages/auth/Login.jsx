import React, { useState } from 'react'
import "./Login.css"
import { Alert, Button, Divider, Input, Space, Tabs } from 'antd'
import { ExclamationCircleOutlined, LockOutlined, LoginOutlined, UserAddOutlined, UserOutlined } from '@ant-design/icons';
import Wave from "react-wavify";
import { NavLink, useNavigate } from 'react-router-dom';
import { useHistory } from 'react-router-dom';
import { apiCall } from '../../helpers';
import { useSignIn } from 'react-auth-kit';

const Login = () => {

    const [login_email, setLogin_email] = useState("hrushikeshchapke@gmail.com");
    const [login_password, setLogin_password] = useState("password");
    const [register_email, setRegister_email] = useState("");
    const [register_password, setRegister_password] = useState("");
    const [register_password_confirm, setRegister_password_confirm] = useState("");

    const [login_errors, setLogin_errors] = useState([]);
    const [register_errors, setRegister_errors] = useState([]);

    const signIn = useSignIn()
    const navigate = useNavigate();


    const tryLogin = () => {
        let errors = [];

        if(!login_email) errors.push("Please enter a valid e-mail.");
        if(!login_password) errors.push("Please enter your password.");

        if(errors.length > 0){
            setLogin_errors(errors);
            return;
        }


        apiCall("/auth/login", {
            email : login_email,
            password : login_password
        }, (response, error) => {
            console.log("LOGIN CALL RESPONSE",response, error);
            
            if(response.data.token){
                if(signIn({
                    token: response.data.token,
                    expiresIn: 86400,
                    tokenType: "Bearer",
                    authState: response.data.user,
                })){
                    navigate('/sheet/');        
                }
                
            }
        })
    }

    const tryRegister = () => {
        let errors = [];

        if(!register_email) errors.push("Please enter a valid e-mail.");
        if(!register_password) errors.push("Please enter your password.");
        if(!register_password_confirm) errors.push("Please confirm your password.");
        if(register_password !== register_password_confirm) errors.push("Your passwords don't match, please try again.");

        if(errors.length > 0){
            setRegister_errors(errors);
            return;
        }

        apiCall("/auth/register", {
            email : register_email,
            password : register_password
        }, (response, error) => {
            console.log("REGISTER CALL RESPONSE",response, error);
            
            if(response.data.token){
                if(signIn({
                    token: response.data.token,
                    expiresIn: 86400,
                    tokenType: "Bearer",
                    authState: response.data.user,
                })){
                    navigate('/sheet/');        
                }
                
            }
        })


    }

    return (

        <div className="login-container">
            <Wave fill='#7a7a7a2f'
                paused={false}
                options={{
                height: 360,
                amplitude: 40,
                speed: 0.15,
                points: 8
                }}
                style={{position : "absolute", bottom : '0px', top : '0px', zIndex : '2 !important'}}
            />
            <div className="sheet login">
                <Tabs tabPosition='bottom'>
                    <Tabs.TabPane tab="Login" key={1} >
                        <Space direction='vertical' align='center' className='fields-container'>
                        <h2 style={{textDecoration : "underline"}}>Login</h2>
                        <Input onChange={(e) => setLogin_email(e.target.value)} type="email" placeholder='Enter E-mail' prefix={<UserOutlined />} />
                        <Input onChange={(e) => setLogin_password(e.target.value)} type="password" placeholder='Enter password' prefix={<LockOutlined />} />
                        <a className='forgot-btn' href="#">Forgot Password?</a>
                        {login_errors.map((error, index) => {
                            return (
                                <Alert icon={<ExclamationCircleOutlined />} showIcon style={{fontSize : "0.8em"}} message={error} key={index} type="error" />
                            )
                        })}
                        <br></br>
                        <Button type='primary' onClick={() => tryLogin()} icon={<LoginOutlined/>}>Login</Button>
                        <br></br>
                        </Space>
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Register" key={2} >
                        <Space direction='vertical' align='center' className='fields-container'>
                            <h2 style={{textDecoration : "underline"}}>Register</h2>
                            <Input onChange={(e) => setRegister_email(e.target.value)} type="email" placeholder='Enter E-mail' prefix={<UserOutlined />} />
                            <Input onChange={(e) => setRegister_password(e.target.value)} type="password" placeholder='Enter password' prefix={<LockOutlined />} />
                            <Input onChange={(e) => setRegister_password_confirm(e.target.value)} type="password" placeholder='Confirm password' prefix={<LockOutlined />} />
                            {register_errors.map((error, index) => {
                                return (
                                    <Alert icon={<ExclamationCircleOutlined />} showIcon style={{fontSize : "0.8em"}} message={error} key={index} type="error" />
                                )
                            })}
                            <br></br>
                            <Button onClick={() => tryRegister()} type='primary' icon={<UserAddOutlined/>}>Register</Button>
                            <br></br>
                        </Space>
                    </Tabs.TabPane>
                </Tabs>

            </div>
        </div>
    )
}

export default Login;