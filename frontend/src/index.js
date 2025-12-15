import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App"; 
import Closet from "./closet"; 
import ClosetDetail from "./closet_detail"; 
import AIRecommend from "./AIRecommend";
import AIResult from "./AIResult";
import UploadCloth from "./UploadCloth";
import CalendarPage from "./CalendarPage";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <BrowserRouter>
        <Routes>
            {/* 메인 화면 */}
            <Route path="/" element={<App />} />
            <Route path="/calendar" element={<CalendarPage />} />
            {/* 옷장 관련 */}
            <Route path="/closet" element={<Closet />} />
            <Route path="/closet/detail" element={<ClosetDetail />} />
            
            <Route path="/closet/upload" element={<UploadCloth />} />
            
            {/* AI 관련 */}
            <Route path="/AI" element={<AIRecommend />} />
            <Route path="/AI/result" element={<AIResult />} />
            
        </Routes>
    </BrowserRouter>
);