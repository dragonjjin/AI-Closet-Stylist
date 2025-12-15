import fetch from "node-fetch";
import dotenv from "dotenv";
import { getWeatherByRequest } from "./WeatherService.js";

dotenv.config();

// ==========================================
// [설정] 사용하려는 Gemini 모델명을 여기서 변경하세요
// 예: gemma-3-27b-it, gemma-3-4b-it, gemma-3-12b-it
// ==========================================
const GEMINI_MODEL = "gemma-3-12b-it"; 

/**
 * 날씨 데이터를 프롬프트용 문자열로 변환하는 헬퍼 함수
 */
function formatWeatherForPrompt(weatherData) {
    try {
        if (!weatherData || !weatherData.landFcst || !weatherData.landFcst.items) {
            return "날씨 정보를 불러올 수 없습니다.";
        }

        const location = weatherData.location;
        const items = weatherData.landFcst.items;
        
        // 현재 시점부터 가까운 미래 5개 데이터만 추출
        const forecastList = items.slice(0, 5).map(item => {
            const dateStr = item.TM_EF; 
            const month = dateStr.slice(4, 6);
            const day = dateStr.slice(6, 8);
            const hour = dateStr.slice(8, 10);
            
            const temp = item.TA === "-99" ? "정보없음" : `${item.TA}°C`;
            const sky = item.WF; 
            
            return `- ${month}/${day} ${hour}시 예보: 기온 ${temp}, 날씨 ${sky}`;
        }).join("\n");

        return `위치: ${location.city} (${location.region})\n${forecastList}`;
    } catch (e) {
        console.error("날씨 포맷팅 실패:", e);
        return "날씨 정보를 분석하는 중 오류가 발생했습니다.";
    }
}

/**
 * 옷 추천 함수
 */
export async function getRecommendations(req, selected, clothes) {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // [수정됨] 상단 변수(GEMINI_MODEL)를 사용하여 URL 생성
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`;

    // 1. WeatherService를 통해 요청자의 위치 기반 날씨 가져오기
    let weatherInfoString = "";
    try {
        const weatherData = await getWeatherByRequest(req);
        weatherInfoString = formatWeatherForPrompt(weatherData);
    } catch (error) {
        console.error("WeatherService 호출 실패:", error);
        weatherInfoString = "날씨 정보를 가져올 수 없습니다. 일반적인 추천을 제공하세요.";
    }

    // 2. 프롬프트 구성 (reason 필드 포함)
    const prompt = `
당신은 패션 코디 전문가입니다.
사용자의 옷장 데이터와 현재 사용자 위치의 날씨 정보를 바탕으로 최적의 코디를 추천해주세요.

[현재 날씨 예보]
${weatherInfoString}

[사용자 보유 옷 목록 (JSON)]
${JSON.stringify(clothes, null, 2)}

[사용자가 고정한 옷 (고정된 항목은 변경 불가, 없으면 null)]
${JSON.stringify(selected, null, 2)}

[규칙]
1. 응답은 반드시 JSON 배열 형식이어야 합니다.
2. 각 객체는 "outer", "top", "bottom", "shoes"의 id와 **"reason"**을 포함해야 합니다.
   - 해당 카테고리에 입을 옷이 없다면 null이 아닌 가장 적절한 옷을 선택하세요.
3. **중요: 위 날씨 정보를 바탕으로 기온과 강수 여부를 판단하여 옷을 선택하고, 그 이유를 "reason" 필드에 한두 문장으로 간결하게 한국어로 작성하세요.**
   - (예: "영하의 기온이라 보온성이 좋은 롱패딩을 선택했고, 눈 소식이 있어 미끄러지지 않는 부츠를 매치했습니다.")
4. 선택된 항목(사용자 고정)은 절대 변경하지 말고 그대로 포함하세요.
5. 설명이나 잡담 없이 오직 JSON 데이터만 출력하세요.
6. 추천은 최대 4개 조합까지 생성하세요.
7. 출력 예시:
[
  { 
    "outer": "outer-001", 
    "top": "top-003", 
    "bottom": "pants-002", 
    "shoes": "shoes-004",
    "reason": "기온이 10도 안팎이라 가벼운 트렌치코트를 추천하며, 비가 올 수 있어 어두운 색 신발을 매치했습니다."
  }
]

추천을 시작하세요.
`;

    const body = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    try {
        // 3. Gemini 호출
        console.log(`[Gemini] 모델 ${GEMINI_MODEL}로 요청을 보냅니다...`);
        
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        if (data.error) {
            console.error("Gemini API Error:", JSON.stringify(data.error, null, 2));
            return [];
        }

        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
        console.log("Gemini 응답:", text);

        // 4. JSON 파싱
        const jsonStart = text.indexOf("[");
        const jsonEnd = text.lastIndexOf("]");

        if (jsonStart === -1 || jsonEnd === -1) {
             console.error("유효한 JSON 형식이 아닙니다.");
             return [];
        }

        const jsonPart = text.slice(jsonStart, jsonEnd + 1);
        return JSON.parse(jsonPart);

    } catch (error) {
        console.error("Gemini 서비스 오류:", error);
        return [];
    }
}