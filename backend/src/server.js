import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getRecommendations } from "./services/geminiService.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path"; // ReferenceError 해결을 위해 path 모듈 import

dotenv.config();

// ES Modules 환경에서 __dirname 정의 (ReferenceError 해결)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (_req, res) => {
    res.json({ status: "ok", service: "AI Closet Stylist (Local JSON)" });
});

app.post("/api/recommend", async (req, res) => {
    try {
        const { clothes = [], selected = {} } = req.body;
        const recs = await getRecommendations(selected, clothes);
        res.json({ recommendations: recs });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.get("/api/clothes", (req, res) => {
    const filePath = path.join(__dirname, "../data", "clothes.json");

    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
            console.error("파일 읽기 에러:", err);
            if (err.code === "ENOENT") {
                return res
                    .status(404)
                    .json({ error: "clothes.json 파일을 찾을 수 없습니다." });
            }
            return res
                .status(500)
                .json({ error: "데이터를 읽을 수 없습니다." });
        }
        res.json(JSON.parse(data));
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () =>
    console.log(`[server] running on http://localhost:${PORT}`)
);
