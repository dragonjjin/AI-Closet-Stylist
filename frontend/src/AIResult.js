import React, { useEffect, useState } from "react";
import "./AIResult.css";

export default function AIResult() {
    const [results, setResults] = useState([]); // AI 추천 결과
    const [clothes, setClothes] = useState([]); // 로컬 옷 데이터 (id -> 매칭용)
    const [loading, setLoading] = useState(true);

    // ────────────────────────────────
    // 1️⃣ 로컬 데이터 불러오기
    // ────────────────────────────────
    useEffect(() => {
        const loadData = async () => {
            try {
                const res = await fetch("/data/clothes.json", {
                    cache: "no-store",
                });
                const data = await res.json();
                setClothes(data);
            } catch (err) {
                console.error("옷 데이터 로드 실패:", err);
            }
        };
        loadData();
    }, []);

    // ────────────────────────────────
    // 2️⃣ AI 결과 (임시 mock)
    // ────────────────────────────────
    useEffect(() => {
        const mockAIResponse = [
            {
                outer: "outer-001",
                top: "top-002",
                bottom: "bottom-003",
                shoes: "shoes-004",
            },
            {
                outer: "outer-005",
                top: "top-006",
                bottom: "bottom-007",
                shoes: "shoes-008",
            },
        ];
        setResults(mockAIResponse);
    }, []);

    // ────────────────────────────────
    // 3️⃣ id → 옷 정보 찾기
    // ────────────────────────────────
    const findItemById = (id) => {
        return clothes.find((item) => item.id === id);
    };

    // 데이터가 다 불러와졌는지 확인
    useEffect(() => {
        if (results.length && clothes.length) setLoading(false);
    }, [results, clothes]);

    if (loading) return <p style={{ padding: "20px" }}>불러오는 중...</p>;

    // ────────────────────────────────
    // 4️⃣ 렌더링
    // ────────────────────────────────
    return (
        <div className="ai-result-page">
            <h2>AI 추천 코디 결과</h2>
            <p>총 {results.length}개의 코디가 추천되었습니다.</p>

            <div className="result-list">
                {results.map((set, idx) => (
                    <div key={idx} className="result-card">
                        <h3>코디 #{idx + 1}</h3>
                        <div className="result-items">
                            {["outer", "top", "bottom", "shoes"].map((type) => {
                                const item = findItemById(set[type]);
                                return (
                                    <div key={type} className="result-item">
                                        <div className="item-type">
                                            {type.toUpperCase()}
                                        </div>
                                        {item ? (
                                            <>
                                                <img
                                                    src={
                                                        item.imageUrl ||
                                                        "/images/placeholder.png"
                                                    }
                                                    alt={item.name || type}
                                                    onError={(e) =>
                                                        (e.target.src =
                                                            "/images/placeholder.png")
                                                    }
                                                />
                                                <p className="brand">
                                                    {item.brand}
                                                </p>
                                                <p className="name">
                                                    {item.name}
                                                </p>
                                            </>
                                        ) : (
                                            <div className="missing">
                                                정보 없음
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
