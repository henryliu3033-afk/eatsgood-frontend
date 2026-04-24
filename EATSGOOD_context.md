# EATSGOOD — 專案脈絡總覽 (Cowork Handoff)
> 這份文件記錄所有已確認的產品決策、技術架構、與開發進度。
> 請在 Cowork 對話開頭貼上此文件，即可無縫接續開發。

---

## 1. 產品定位

**EATSGOOD** 是專為台灣市場打造的「味覺社交」網頁平台（Web-First）。

核心機制是 **Trust Density（信任密度）**：用戶不是在為餐廳打星級，而是「強推特定必吃品項」。當單一品項累積 **100 位獨立用戶推薦**，觸發「全城熱議（Viral）」狀態，強制推播至首頁 Hero。

### 品牌識別
- **品牌名**：EATSGOOD（諧音 "It's good"）
- **主色**：Blood Orange `#EA580C`
- **背景**：暖白 `#FAF7F2`（Light） / 深灰 `#1C1C1E`（Dark）
- **字體**：Geist（主體） + Instrument Serif italic（Hero 裝飾）

---

## 2. 技術架構（全部已確認）

```
前端：Next.js 16 (App Router) + TypeScript + Tailwind CSS v3 + Framer Motion
路徑：C:\Users\henry\coding-space\eatsgood\
部署：Vercel

後端：FastAPI (Python) + Uvicorn
路徑：C:\Users\henry\coding-space\eatsgood-backend\（獨立 repo）
部署：Railway

資料庫：PostgreSQL 17（本地已建好 eatsgood-db，Railway 正式環境）
快取 / 鎖：Redis（Docker 本地開發）
圖片儲存：Cloudflare R2（免費出流量，S3 相容 API）
登入：FastAPI 自建（Google OAuth + LINE OAuth + Email）
AI 摘要：暫緩
```

---

## 3. 資料庫 Schema（已確認）

```sql
-- 用戶
users (id UUID PK, email, display_name, avatar_url,
       auth_provider ENUM('google','line','email'), provider_id, created_at)

-- 吃貨等級（獨立表，避免更新鎖主表）
user_trust_scores (
  user_id UUID PK → users.id,
  recommendation_count INT,
  received_likes INT,
  received_saves INT,
  trust_score FLOAT,
  level ENUM('新手吃貨','資深吃貨','美食達人','頂級老饕'),
  updated_at TIMESTAMP
)

-- 餐廳（用戶自建 + Google Places API 兩者並存）
restaurants (
  id UUID PK, name, address, district, lat, lng,
  google_place_id VARCHAR UNIQUE NULL,
  category, opening_hours JSONB,
  created_by UUID → users.id, created_at
)

-- 品項
menu_items (
  id UUID PK, restaurant_id UUID → restaurants.id,
  name, description, price DECIMAL NULL,
  image_url VARCHAR NULL,
  created_by UUID → users.id, created_at
)

-- 推薦（核心表）
recommendations (
  id UUID PK, user_id UUID → users.id,
  restaurant_id UUID NULL → restaurants.id,
  menu_item_id  UUID NULL → menu_items.id,
  caption TEXT, image_urls VARCHAR[],
  trust_weight FLOAT,
  created_at TIMESTAMP,
  UNIQUE (user_id, restaurant_id),
  UNIQUE (user_id, menu_item_id),
  CONSTRAINT check_target CHECK (
    (restaurant_id IS NOT NULL AND menu_item_id IS NULL) OR
    (menu_item_id  IS NOT NULL AND restaurant_id IS NULL)
  )
)

-- 爆紅狀態
viral_status (
  target_type ENUM('restaurant','menu_item') PK,
  target_id   UUID PK,
  unique_recommenders INT DEFAULT 0,
  weighted_score      FLOAT DEFAULT 0,
  is_viral            BOOLEAN DEFAULT FALSE,
  went_viral_at       TIMESTAMP NULL,
  updated_at          TIMESTAMP
)

-- 互動行為
recommendation_interactions (
  user_id           UUID → users.id,
  recommendation_id UUID → recommendations.id,
  type ENUM('like','save','me_too'),
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, recommendation_id, type)
)
```

---

## 4. API 路由（已確認）

```
POST /auth/google       Google OAuth
POST /auth/line         LINE OAuth
POST /auth/register     Email 註冊
POST /auth/login        Email 登入

GET  /users/me
PUT  /users/me
GET  /users/{id}

GET  /restaurants
POST /restaurants
GET  /restaurants/{id}
POST /restaurants/{id}/menu-items
GET  /menu-items/{id}

POST /recommendations
GET  /recommendations/{id}
POST /recommendations/{id}/like
POST /recommendations/{id}/save
POST /recommendations/{id}/me-too

GET  /feed/viral
GET  /feed/trending
GET  /search
```

---

## 5. 後端安全機制（已確認）

| 用途 | 機制 |
|---|---|
| Race Condition 防護 | Redis 分散式鎖（SETNX） |
| JWT 黑名單 | Redis Key-Value + TTL |
| 推薦唯一性 | DB UNIQUE constraint |

- JWT：python-jose，HS256，Access Token 60 分鐘
- Pydantic v2：所有 Request/Response schema 驗證
- Pytest + httpx：auth / recommendations / race condition 測試
- viral_status 更新：Railway Cron Job 排程，非即時

### 後端專案結構
```
eatsgood-backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── redis_client.py
│   ├── models/
│   ├── schemas/
│   ├── routers/        # auth / users / restaurants / menu_items / recommendations / feed
│   ├── services/       # recommendation / viral / trust / auth
│   └── dependencies/   # auth.py / rate_limit.py
├── tests/
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_recommendations.py
│   └── test_viral.py
├── alembic/
├── docker-compose.yml
├── Dockerfile
├── railway.toml
├── requirements.txt
└── .env.example
```

---

## 6. 後端 requirements.txt（已確認）

```
fastapi==0.135.1
uvicorn[standard]==0.41.0
starlette==0.52.1
python-multipart==0.0.22
pydantic==2.12.5
pydantic-settings==2.9.1
pydantic[email]==2.12.5
python-dotenv==1.2.2
SQLAlchemy==2.0.49
asyncpg==0.30.0
psycopg2-binary==2.9.12
alembic==1.16.1
redis[asyncio]==5.2.1
python-jose[cryptography]==3.5.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
cryptography==46.0.6
httpx==0.28.1
boto3==1.38.0
pytest==8.3.5
pytest-asyncio==0.26.0
```

---

## 7. 吃貨等級計算邏輯（已確認）

```
trust_score = (recommendation_count × 1.0)
            + (received_likes        × 0.5)
            + (received_saves        × 0.8)

新手吃貨  → 0   ≤ score < 10
資深吃貨  → 10  ≤ score < 50
美食達人  → 50  ≤ score < 150
頂級老饕  → 150 ≤ score
```

---

## 8. 前端現況（2026-04-24 完成）

### 已完成 ✅
- Next.js 16 專案初始化（Tailwind v3 + Framer Motion）
- 完整 Component 拆分：
  - `Nav.tsx`：Sticky + 毛玻璃 + Scroll 效果
  - `Hero.tsx`：Viral Showcase 大圖 + 信任密度
  - `FeedGrid.tsx`：響應式 1~4 欄格線
  - `DishCard.tsx`：Hover 浮起 + 快速愛心/收藏
  - `DishModal.tsx`：Spring 動畫 + 左圖右文
  - `TrustDensity.tsx`：進度條 + Avatar 堆疊
  - `FilterRail.tsx`：Hashtag chip 實際過濾
  - `SearchBar.tsx`：全屏搜尋 Overlay + 即時結果
  - `RecommendModal.tsx`：三步驟推薦表單
  - `AuthModal.tsx`：Google / LINE / Email 登入
  - `ThemeToggle.tsx`：深色/淺色模式切換
- `context/AuthContext.tsx`：全站登入狀態管理
- `context/ThemeContext.tsx`：深色模式（CSS 變數 + localStorage）
- `lib/types.ts`：完整 TypeScript 型別
- `lib/mockData.ts`：8 筆 mock 資料 + Viral 品項
- **Auth Guard**：未登入點愛心/收藏 → 自動彈出登入 Modal
- **深色模式**：全站 CSS 變數，自動偵測系統偏好

### 待開發（前端）
- [ ] 接 API（`getDishes()` / `getHeroDish()` / `recommendDish(id)`）
- [ ] 用戶個人頁面
- [ ] 登入後換成真實用戶頭像

### 設計 CSS 變數（Light / Dark）
```css
/* Light */
--bg: #FAF7F2;  --card: #FFFFFF;  --surface: #F0EBE4;
--ink: #1A0F08; --ink2: #5B4E45;  --ink3: #9A8D83;
--brand: #EA580C; --brand-soft: #FFF1E6;

/* Dark */
--bg: #1C1C1E;  --card: #2C2C2E;  --surface: #3A3A3C;
--ink: #F2EDE8; --ink2: #C4B8B0;  --ink3: #7A6E68;
--brand: #F97316; --brand-soft: #2A1F15;
```

---

## 9. 下一步（後端）

1. **搭骨架**：`eatsgood-backend/` 完整 boilerplate
2. **DB Migration**：Alembic 建立所有表（連接本地 `eatsgood-db`）
3. **Auth 模組**：JWT + Google / LINE / Email
4. **Recommendations API**：核心邏輯 + Redis 分散式鎖
5. **Feed API**：viral / trending / search
6. **串接前端**：替換 mock data
7. **部署**：Vercel（前端）+ Railway（後端）

---

*最後更新：2026-04-24 | 由 Claude Sonnet 4.6 生成*
