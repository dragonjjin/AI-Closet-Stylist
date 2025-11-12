import React, { useState, useEffect } from "react";
import "./AIRecommend.css";

const CATEGORIES = ["아우터", "상의", "하의", "신발"];

export default function AIRecommend() {
    const [items, setItems] = useState([]);
    const [currentCategory, setCurrentCategory] = useState("아우터");
    const [selected, setSelected] = useState({
        아우터: null,
        상의: null,
        하의: null,
        신발: null,
    });

    // 옷 데이터 로드
    useEffect(() => {
        (async () => {
            const res = await fetch("/data/clothes.json");
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []);
        })();
    }, []);

    // 현재 카테고리별 옷 목록
    const filtered = items.filter((i) => i.type === currentCategory);

    // 선택된 카테고리 칸 클릭 시 왼쪽 카테고리 변경
    const handleCategoryClick = (category) => {
        setCurrentCategory(category);
    };

    // 왼쪽 목록에서 옷 선택
    const handleSelectItem = (item) => {
        setSelected((prev) => ({
            ...prev,
            [currentCategory]: item,
        }));
    };

    // X 버튼 클릭 → 해당 칸 비우기
    const handleRemove = (category) => {
        setSelected((prev) => ({
            ...prev,
            [category]: null,
        }));
    };

    const handleNext = () => {
        const finalSelection = {};

        CATEGORIES.forEach((cat) => {
            const chosen = selected[cat];

            // 사용자가 직접 선택한 경우만 fixed:true
            if (chosen) {
                finalSelection[cat] = { ...chosen, fixed: true };
            } else {
                finalSelection[cat] = null; // 아무것도 선택하지 않으면 null (AI가 알아서)
            }
        });

        // 결과 페이지로 전달
        localStorage.setItem("selectedClothes", JSON.stringify(finalSelection));
        window.location.href = "AI/result";
    };

    return (
        <div className="ai-page">
            <nav className="nav">
                <a href="/" className="logo">
                    AI Closet
                </a>
                <a href="/closet" className="link">
                    내 옷장
                </a>
            </nav>

            <main className="ai-container">
                <h1>AI 추천을 위한 옷 선택</h1>

                <div className="ai-layout">
                    {/* 왼쪽: 옷 목록 */}
                    <section className="clothes-list">
                        <h2>{currentCategory}</h2>
                        {filtered.length === 0 ? (
                            <p className="empty">
                                이 카테고리에는 옷이 없습니다.
                            </p>
                        ) : (
                            filtered.map((item) => (
                                <div
                                    key={item.id}
                                    className={`cloth-card ${
                                        selected[currentCategory]?.id ===
                                        item.id
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => handleSelectItem(item)}
                                >
                                    <img src={item.imageUrl} alt={item.name} />
                                    <div className="meta">
                                        <div className="brand">
                                            {item.brand}
                                        </div>
                                        <div className="name">{item.name}</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>

                    {/* 오른쪽: 카테고리별 선택 칸 */}
                    <aside className="selected-panel">
                        {CATEGORIES.map((cat) => (
                            <div
                                key={cat}
                                className={`select-slot ${
                                    currentCategory === cat ? "active" : ""
                                }`}
                                onClick={() => handleCategoryClick(cat)}
                            >
                                <div className="slot-header">
                                    <span>{cat}</span>
                                    {selected[cat] && (
                                        <button
                                            className="remove-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemove(cat);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                {selected[cat] ? (
                                    <div className="slot-item">
                                        <img
                                            src={selected[cat].imageUrl}
                                            alt={selected[cat].name}
                                        />
                                        <div>{selected[cat].name}</div>
                                    </div>
                                ) : (
                                    <div className="slot-empty">
                                        선택된 옷 없음
                                    </div>
                                )}
                            </div>
                        ))}
                    </aside>
                </div>

                {/* 다음 단계 버튼 */}
                <button className="recommend-btn" onClick={handleNext}>
                    AI 추천받기 →
                </button>
            </main>
        </div>
    );
}
