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

資料庫：PostgreSQL 17（本地 eatsgood-db，Railway 正式環境）
快取 / 鎖：Redis（Docker 本地開發）
圖片儲存：Cloudflare R2（免費出流量，S3 相容 API）
登入：FastAPI 自建（Google OAuth + LINE OAuth + Email）
AI 摘要：暫緩
```

---

## 3. 本地環境設定（已確認可運作）

### 後端環境
- **Python venv**：`C:\Users\henry\coding-space\PYTHON-FASTAPI\.venv`
- **PostgreSQL**：本地 port 5432，資料庫名 `eatsgood-db`，user `postgres`，password `eatsgood123`
- **Redis**：Docker container `eatsgood-redis`，port 6379
- **async driver**：`psycopg[binary]==3.3.3`（取代 asyncpg，Windows 免 Build Tools）
- **sync driver（Alembic）**：`psycopg2-binary==2.9.12`

### 後端 .env（已設定）
```
DATABASE_URL=postgresql+psycopg://postgres:eatsgood123@localhost:5432/eatsgood-db
SECRET_KEY=eatsgood-super-secret-key-2026
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:3000
```

### alembic.ini（已設定）
```
sqlalchemy.url = postgresql+psycopg2://postgres:eatsgood123@localhost:5432/eatsgood-db
```

### 後端啟動指令
```powershell
cd C:\Users\henry\coding-space\eatsgood-backend
docker-compose up -d                    # 啟動 Redis
uvicorn app.main:app --reload           # 啟動 FastAPI（port 8000）
```

---

## 4. 資料庫 Schema（已 migration 完成 ✅）

```sql
users (id UUID PK, email, display_name, avatar_url,
       auth_provider ENUM('google','line','email'), provider_id,
       hashed_password, created_at)

user_trust_scores (
  user_id UUID PK → users.id,
  recommendation_count INT, received_likes INT, received_saves INT,
  trust_score FLOAT,
  level ENUM('新手吃貨','資深吃貨','美食達人','頂級老饕'),
  updated_at TIMESTAMP
)

restaurants (
  id UUID PK, name, address, district, lat, lng,
  google_place_id VARCHAR UNIQUE NULL,
  category, opening_hours JSON,
  created_by UUID → users.id, created_at
)

menu_items (
  id UUID PK, restaurant_id UUID → restaurants.id,
  name, description, price DECIMAL NULL,
  image_url VARCHAR NULL,
  created_by UUID → users.id, created_at
)

recommendations (
  id UUID PK, user_id UUID → users.id,
  restaurant_id UUID NULL → restaurants.id,
  menu_item_id  UUID NULL → menu_items.id,
  caption TEXT, image_urls JSON,
  trust_weight FLOAT, created_at TIMESTAMP,
  UNIQUE (user_id, restaurant_id),
  UNIQUE (user_id, menu_item_id),
  CHECK (restaurant_id XOR menu_item_id)
)

viral_status (
  target_type ENUM('restaurant','menu_item') PK,
  target_id UUID PK,
  unique_recommenders INT, weighted_score FLOAT,
  is_viral BOOLEAN, went_viral_at TIMESTAMP, updated_at TIMESTAMP
)

recommendation_interactions (
  user_id UUID, recommendation_id UUID,
  type ENUM('like','save','me_too'),
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, recommendation_id, type)
)
```

---

## 5. API 路由（已實作並測試 ✅）

```
POST /auth/register     ✅ 測試通過
POST /auth/login        ✅ 測試通過
POST /auth/logout       ✅ JWT 黑名單
POST /auth/google       預留（501）
POST /auth/line         預留（501）

GET  /users/me          ✅ 測試通過
PUT  /users/me
GET  /users/{id}        ✅

GET  /restaurants       ✅
POST /restaurants       ✅ 測試通過
GET  /restaurants/{id}
POST /restaurants/{id}/menu-items
GET  /menu-items/{id}

POST /recommendations   ✅（需 Redis running）
GET  /recommendations/{id}
POST /recommendations/{id}/like
POST /recommendations/{id}/save
POST /recommendations/{id}/me-too

GET  /feed/viral
GET  /feed/trending
GET  /search?q=...
GET  /health            ✅ 測試通過
```

API 文件：http://localhost:8000/docs

---

## 6. 後端安全機制（已實作）

| 用途 | 機制 |
|---|---|
| Race Condition 防護 | `redis_lock` async context manager（SETNX + TTL） |
| JWT 黑名單 | Redis Key-Value + TTL（logout 時寫入） |
| 推薦唯一性 | DB UNIQUE constraint |
| 互動唯一性 | DB PRIMARY KEY（user_id + recommendation_id + type） |
| 密碼雜湊 | passlib bcrypt |
| 關聯載入 | selectinload 避免 lazy-load MissingGreenlet 錯誤 |

---

## 7. 後端檔案結構（已完成 ✅）

```
eatsgood-backend/
├── app/
│   ├── main.py                  # FastAPI app + CORS + router 掛載
│   ├── config.py                # pydantic-settings，讀取 .env
│   ├── database.py              # async engine（psycopg driver）+ get_db
│   ├── redis_client.py          # aioredis 單例 + get_redis
│   ├── models/                  # User, UserTrustScore, Restaurant, MenuItem,
│   │                            # Recommendation, RecommendationInteraction, ViralStatus
│   ├── schemas/                 # Pydantic v2 Request/Response schemas
│   ├── routers/                 # auth, users, restaurants, menu_items,
│   │                            # recommendations（_rec_query selectinload）, feed
│   ├── services/                # auth（JWT/bcrypt）, recommendation（redis_lock）, feed
│   └── dependencies/
│       └── auth.py              # get_current_user（JWT + Redis blacklist + selectinload）
├── tests/                       # 11 tests 全通過（SQLite in-memory + redis mock）
├── alembic/                     # env.py 自動 import 所有 models
├── alembic.ini                  # psycopg2://postgres:eatsgood123@localhost/eatsgood-db
├── docker-compose.yml           # Redis 7 alpine
├── Dockerfile                   # python:3.12-slim
├── railway.toml
├── pytest.ini                   # asyncio_mode = auto
├── requirements.txt
└── .env / .env.example
```

---

## 8. 後端 requirements.txt（關鍵套件）

```
fastapi==0.135.1
uvicorn[standard]==0.41.0
SQLAlchemy==2.0.49
psycopg[binary]==3.3.3          # async PostgreSQL driver（Windows 免 Build Tools）
psycopg2-binary==2.9.12         # sync driver（Alembic 專用）
alembic==1.16.1
redis[asyncio]==5.2.1
python-jose[cryptography]==3.5.0
passlib[bcrypt]==1.7.4
pydantic==2.12.5
pydantic-settings==2.9.1
httpx==0.28.1
boto3==1.38.0
pytest==8.3.5
pytest-asyncio==0.26.0
```

---

## 9. 吃貨等級計算邏輯（已實作）

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

## 10. 前端現況（UI 完成，尚未串接後端）

### 前端檔案結構
```
eatsgood/
├── app/
│   ├── globals.css          # CSS 變數（Light / Dark）+ Tailwind 指令
│   ├── layout.tsx           # FOUC 防閃爍腳本 + ThemeProvider + AuthProvider
│   └── page.tsx             # 主頁面
├── components/
│   ├── Nav.tsx              # Sticky + 毛玻璃 + ThemeToggle + 登入狀態
│   ├── Hero.tsx             # Viral Showcase 大圖 + 信任密度進度條
│   ├── FeedGrid.tsx         # 響應式 1~4 欄格線
│   ├── DishCard.tsx         # next/image (fill + sizes) + Auth Guard
│   ├── DishModal.tsx        # Spring 動畫 + 左圖右文 + 互動按鈕
│   ├── TrustDensity.tsx     # 進度條 + Avatar 堆疊
│   ├── FilterRail.tsx       # Hashtag chip 過濾 Feed
│   ├── SearchBar.tsx        # 全屏搜尋 Overlay
│   ├── RecommendModal.tsx   # 三步驟推薦表單（useScrollLock）
│   ├── AuthModal.tsx        # Google / LINE / Email 登入（目前 mock）
│   └── ThemeToggle.tsx      # 深色模式切換
├── context/
│   ├── AuthContext.tsx      # 全站登入狀態（目前 mock login）
│   └── ThemeContext.tsx     # dark/light + localStorage
├── hooks/
│   └── useScrollLock.ts
├── lib/
│   ├── types.ts             # TypeScript 型別定義
│   └── mockData.ts          # 8 筆 mock 推薦（待替換）
└── tailwind.config.js       # CSS 變數橋接
```

### 設計 CSS 變數（Light / Dark）
```css
/* Light */
--bg: #FAF7F2;  --card: #FFFFFF;  --surface: #F0EBE4;
--ink: #1A0F08;  --ink2: #5B4E45;  --ink3: #9A8D83;
--brand: #EA580C;  --brand-soft: #FFF1E6;
--overlay: rgba(26,15,8,0.6);

/* Dark */
--bg: #1C1C1E;  --card: #2C2C2E;  --surface: #3A3A3C;
--ink: #F2EDE8;  --ink2: #C4B8B0;  --ink3: #7A6E68;
--brand: #F97316;  --brand-soft: #2A1F15;
--overlay: rgba(0,0,0,0.75);
```

---

## 11. 待開發（下一步）

### 優先：前後端串接
- [ ] 建立 `lib/api.ts`：封裝所有 fetch 呼叫（帶 JWT token，base URL `http://localhost:8000`）
- [ ] `AuthContext.tsx` 登入/註冊改為打真實 `/auth/login` 和 `/auth/register`
- [ ] `page.tsx` 的 Feed 改為打 `/feed/trending` 真實 API
- [ ] `FeedGrid.tsx` / `DishCard.tsx` 接真實推薦資料
- [ ] `SearchBar.tsx` 接 `/search?q=...`
- [ ] `next.config.ts` 加 `images.remotePatterns`（Unsplash / pravatar / R2）

### 功能擴充
- [ ] 用戶個人頁面（前端）
- [ ] `RecommendModal.tsx` 打真實 `/recommendations` API
- [ ] Google / LINE OAuth（後端 services/auth.py 已預留位置）
- [ ] Cloudflare R2 圖片上傳（boto3 已在 requirements）

### 部署
- [ ] Vercel（前端）
- [ ] Railway（後端 + PostgreSQL）

---

*最後更新：2026-04-25 | 由 Claude Sonnet 4.6 生成*
