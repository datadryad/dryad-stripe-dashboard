import React from 'react'
import { Route, Routes } from "react-router-dom";
import Login from "./Login";


// ReactDOM.render(<App />, document.getElementById('root'))

export default () => {
    return (
        <Routes>
            <Route path="" element={<Login/>} />
        </Routes>
    )
}
