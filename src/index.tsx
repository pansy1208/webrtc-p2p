import React from 'react';
import ReactDOM from 'react-dom/client';
import {HashRouter} from "react-router-dom";
import App from './App';

import "webrtc-adapter"
import "@/assets/css/reset.css"

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <HashRouter>
        <App/>
    </HashRouter>
);
