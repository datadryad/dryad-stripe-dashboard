import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App' 
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SheetRoutes from './pages/sheets/SheetRoutes'
import AuthRoutes from './pages/auth/AuthRoutes'
// ReactDOM.render(<App />, document.getElementById('root'))
import { AuthProvider, RequireAuth } from 'react-auth-kit'

ReactDOM.render(
    
    <AuthProvider
        authType='cookie'
        authName='_auth'
        expiresIn={86400}
        cookieDomain={window.location.hostname}
        cookieSecure={window.location.protocol === "https:"}
    >
        <Router>
            <Routes>
                <Route path="/" element={ <AuthRoutes/> } />

                <Route path="sheet/*" element={
                    <RequireAuth loginPath={'/'}>
                        <SheetRoutes/>
                    </RequireAuth>
                }></Route>
            </Routes>
        </Router>
    </AuthProvider>
    ,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister()
