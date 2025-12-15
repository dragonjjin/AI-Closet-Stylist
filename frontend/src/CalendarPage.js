import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css"; 
import "./CalendarPage.css"; 

export default function CalendarPage() {
    const navigate = useNavigate();

    // ─────────────── [상태 관리] ───────────────
    const [viewDate, setViewDate] = useState(new Date()); 
    const [selectedDate, setSelectedDate] = useState(null); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    
    // [핵심] events 상태를 localStorage와 연동
    const [events, setEvents] = useState({});
    const [newEventInput, setNewEventInput] = useState(""); 

    // 컴포넌트 로드 시 localStorage에서 일정 불러오기
    useEffect(() => {
        const savedEvents = localStorage.getItem("myCalendarEvents");
        if (savedEvents) {
            setEvents(JSON.parse(savedEvents));
        }
    }, []);

    // events 상태가 변경될 때마다 localStorage에 저장
    useEffect(() => {
        // 빈 객체가 아닐 때 혹은 초기 로드 이후 저장
        if (Object.keys(events).length >= 0) {
            localStorage.setItem("myCalendarEvents", JSON.stringify(events));
        }
    }, [events]);

    // ─────────────── [날짜 계산 로직] ───────────────
    const changeMonth = (offset) => {
        const newDate = new Date(viewDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setViewDate(newDate);
    };

    const getDateKey = (year, month, day) => {
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const handleDateClick = (day) => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const dateKey = getDateKey(year, month, day);
        
        setSelectedDate({ year, month, day, dateKey });
        setIsModalOpen(true);
        setNewEventInput(""); 
    };

    // ─────────────── [일정 추가/삭제 로직] ───────────────
    const handleAddEvent = () => {
        if (!newEventInput.trim()) return;
        if (!selectedDate) return;

        const { dateKey } = selectedDate;
        const newEvent = {
            id: Date.now(),
            title: newEventInput,
        };

        setEvents((prev) => {
            const currentDayEvents = prev[dateKey] || [];
            return {
                ...prev,
                [dateKey]: [...currentDayEvents, newEvent]
            };
        });

        setNewEventInput(""); 
    };

    const handleDeleteEvent = (e, dateKey, id) => {
        e.stopPropagation(); 
        setEvents((prev) => {
            const updatedDayEvents = prev[dateKey].filter((evt) => evt.id !== id);
            // 만약 일정이 다 지워지면 키 자체를 삭제할 수도 있지만, 빈 배열로 둬도 무방함
            return {
                ...prev,
                [dateKey]: updatedDayEvents
            };
        });
    };

    // ─────────────── [렌더링 로직] ───────────────
    const renderCalendarGrid = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);
        }

        for (let day = 1; day <= lastDate; day++) {
            const dateKey = getDateKey(year, month, day);
            const dayEvents = events[dateKey] || [];
            
            const currentDate = new Date(year, month, day);
            const isSun = currentDate.getDay() === 0;
            const isSat = currentDate.getDay() === 6;
            
            let cellClass = "cal-cell";
            if (isSun) cellClass += " sun";
            if (isSat) cellClass += " sat";
            
            const today = new Date();
            if (
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day
            ) {
                cellClass += " today";
            }

            days.push(
                <div key={day} className={cellClass} onClick={() => handleDateClick(day)}>
                    <div className="cal-date-num">{day}</div>
                    
                    {/* [수정됨] 점 대신 텍스트 리스트 출력 */}
                    <div className="cal-events-list">
                        {dayEvents.map((evt) => (
                            <div key={evt.id} className="event-item-text">
                                {evt.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="calendar-page-wrapper">
            <nav id="nav3">
                <Link to="/" className="logo">AI Closet</Link>
                <ul>
                    <li><Link to="/closet">옷장</Link></li>
                    <li><Link to="/AI">AI 추천</Link></li>
                    <li><Link to="/calendar" className="active">캘린더</Link></li>
                    <li><a href="#!">menu4</a></li>
                    <li><a href="#!">menu5</a></li>
                </ul>
                <button 
                    className="nav-upload-btn" 
                    onClick={() => navigate("/closet/upload")}
                >
                    옷 등록하기
                </button>
            </nav>

            <main className="calendar-main-container">
                <div className="cal-header">
                    <h2>📅 나의 일정 관리</h2>
                    <p>날짜를 클릭하여 일정을 추가하거나 삭제하세요.</p>
                </div>

                <div className="cal-body">
                    <div className="cal-nav">
                        <button onClick={() => changeMonth(-1)}>◀ 이전 달</button>
                        <h3>{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</h3>
                        <button onClick={() => changeMonth(1)}>다음 달 ▶</button>
                    </div>

                    <div className="cal-grid-header">
                        <div className="sun">일</div>
                        <div>월</div>
                        <div>화</div>
                        <div>수</div>
                        <div>목</div>
                        <div>금</div>
                        <div className="sat">토</div>
                    </div>

                    <div className="cal-grid">
                        {renderCalendarGrid()}
                    </div>
                </div>
            </main>

            {/* 일정 추가/관리 모달 */}
            {isModalOpen && selectedDate && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                {selectedDate.month + 1}월 {selectedDate.day}일 일정
                            </h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>✕</button>
                        </div>
                        
                        <ul className="event-list">
                            {(events[selectedDate.dateKey] || []).length > 0 ? (
                                (events[selectedDate.dateKey]).map((evt) => (
                                    <li key={evt.id}>
                                        <span>▪ {evt.title}</span>
                                        <button 
                                            style={{color:"#e74c3c", background:"none", border:"none", cursor:"pointer", fontWeight:"bold"}}
                                            onClick={(e) => handleDeleteEvent(e, selectedDate.dateKey, evt.id)}
                                        >
                                            삭제
                                        </button>
                                    </li>
                                ))
                            ) : (
                                <li style={{color:"#999", justifyContent:"center"}}>일정이 없습니다.</li>
                            )}
                        </ul>

                        <div className="add-event-box">
                            <input 
                                type="text" 
                                placeholder="일정 입력" 
                                value={newEventInput}
                                onChange={(e) => setNewEventInput(e.target.value)}
                                onKeyDown={(e) => { if(e.key === 'Enter') handleAddEvent(); }}
                            />
                            <button onClick={handleAddEvent}>추가</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}