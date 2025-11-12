// ====== 상태 ======
const state = {
    sourceItems: [],   // setItems로 받은 원본 전체
    items: [],         // 현재 화면에 표시할 목록(필터/정렬 반영)
    filter: "전체",
    page: 1,
    pageSize: 10,
};

// ====== 유틸 ======
const el = (sel) => document.querySelector(sel);
const money = (n) => n.toLocaleString("ko-KR");

// 정렬기능
const Sorter = {
    latest: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0),
    name: (a, b) => (a.title || "").localeCompare(b.title || "", "ko"),
    low: (a, b) => (a.price ?? 0) - (b.price ?? 0),
    high: (a, b) => (b.price ?? 0) - (a.price ?? 0),
};

// ====== 렌더 ======
function renderGrid() {
    const grid = el("#productGrid");
    const empty = el("#emptyHint");
    const pageInfo = el("#pageInfo");
    const prevBtn = el("#prevBtn");
    const nextBtn = el("#nextBtn");

    grid.innerHTML = "";

    if (!state.items.length) {
        empty.hidden = false;
        if (pageInfo) pageInfo.textContent = "1 / 1";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
    }
    empty.hidden = true;

    const totalPages = Math.max(1, Math.ceil(state.items.length / state.pageSize));
    if (state.page > totalPages) state.page = totalPages;
    const start = (state.page - 1) * state.pageSize;
    const slice = state.items.slice(start, start + state.pageSize);

    slice.forEach(makeCard).forEach(card => grid.appendChild(card));

    if (pageInfo) pageInfo.textContent = `${state.page} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = state.page <= 1;
    if (nextBtn) nextBtn.disabled = state.page >= totalPages;
}

function makeCard(item) {
    // item 모델 예:
    // { id, brand, title, price, originPrice, salePercent, type, colors: ["#hex", ...], imageUrl }
    const card = document.createElement("article");
    card.className = "pcard";

    const thumb = document.createElement("div");
    thumb.className = "pthumb";
    if (item.imageUrl) {
        const img = document.createElement("img");
        img.src = item.imageUrl;
        img.alt = item.title || "";
        thumb.appendChild(img);
    }

    const meta = document.createElement("div");
    meta.className = "pmeta";
    meta.innerHTML = `
    <div class="brand">${item.brand ?? ""}</div>
    <div class="title">${item.title ?? ""}</div>
  `;

    const pricebox = document.createElement("div");
    pricebox.className = "pricebox";
    if (item.salePercent) {
        const s = document.createElement("span");
        s.className = "sale";
        s.textContent = `${item.salePercent}%`;
        pricebox.appendChild(s);
    }
    const p = document.createElement("span");
    p.className = "price";
    p.textContent = item.price != null ? `${money(item.price)}원` : "";
    pricebox.appendChild(p);

    if (item.originPrice) {
        const o = document.createElement("span");
        o.className = "origin";
        o.textContent = `${money(item.originPrice)}원`;
        pricebox.appendChild(o);
    }

    const colors = document.createElement("div");
    colors.className = "colors";
    (item.colors ?? []).slice(0, 6).forEach(hex => {
        const dot = document.createElement("span");
        dot.className = "cchip";
        dot.style.background = hex;
        colors.appendChild(dot);
    });

    card.appendChild(thumb);
    card.appendChild(meta);
    card.appendChild(pricebox);
    card.appendChild(colors);
    return card;
}

// ====== 필터 ======
function applyFilter(filter) {
    state.filter = filter || "전체";
    const base = state.sourceItems;
    if (state.filter === "전체") {
        state.items = base.slice();
    } else {
        // item.type: "상의" | "아우터" | "하의" | "신발" 등
        state.items = base.filter(i => i.type === state.filter);
    }
    state.page = 1;
    renderGrid();
}

// ====== API (외부에서 데이터 주입) ======
function setItems(items) {
    const arr = Array.isArray(items) ? items.slice() : [];
    state.sourceItems = arr;     // 원본 유지
    // 기본은 현재 필터 기준으로 반영
    applyFilter(state.filter);
}
function clear() {
    state.sourceItems = [];
    state.items = [];
    state.page = 1;
    renderGrid();
}
function sortBy(key) {
    const map = {
        "정렬: 최신순": "latest",
        "정렬: 이름": "name",
        "정렬: 가격 낮은순": "low",
        "정렬: 가격 높은순": "high",
    };
    const k = map[key] || "latest";
    state.items.sort(Sorter[k]);
    state.page = 1;
    renderGrid();
}

// 전역 등록(콘솔/타 모듈에서 사용)
window.ClosetAPI = { setItems, clear, sortBy, applyFilter, state };

// ====== 이벤트 & 최초 렌더 ======
document.addEventListener("DOMContentLoaded", () => {
    // 페이지네이션
    const prevBtn = el("#prevBtn");
    const nextBtn = el("#nextBtn");
    prevBtn && prevBtn.addEventListener("click", () => { state.page--; renderGrid(); });
    nextBtn && nextBtn.addEventListener("click", () => { state.page++; renderGrid(); });

    // 정렬
    const sortSelect = el("#sortSelect");
    sortSelect && sortSelect.addEventListener("change", (e) => sortBy(e.target.value));

    // NAV 메뉴(전체/상의/아우터/하의/신발)
    document.querySelectorAll("#nav3 [data-filter]").forEach(a => {
        a.addEventListener("click", (e) => {
            e.preventDefault();
            applyFilter(a.dataset.filter);
        });
    });

    // NAV 우측 "옷 등록하기"
    el("#btnNavUpload")?.addEventListener("click", () => {
        alert("옷 등록하기 기능은 준비 중입니다.");
    });

    // 초기 렌더 (빈 상태)
    renderGrid();
});
