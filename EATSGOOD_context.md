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

### 前端啟動指令
```powershell
cd C:\Users\henry\coding-space\eatsgood
npm run dev                             # 啟動 Next.js（port 3000）
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

GET  /restaurants       ✅（支援 ?q= 名稱搜尋）
POST /restaurants       ✅ 測試通過（需登入）
GET  /restaurants/{id}
POST /restaurants/{id}/menu-items

POST /recommendations   ✅（需 Redis running + 登入）
GET  /recommendations/{id}
POST /recommendations/{id}/like
POST /recommendations/{id}/save
POST /recommendations/{id}/me-too

GET  /feed/viral        ✅（response_model=list[FeedItemOut]）
GET  /feed/trending     ✅（response_model=list[FeedItemOut]）
GET  /feed/search?q=    ✅（response_model=list[RecommendationOut]）
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
│   ├── schemas/
│   │   ├── user.py              # UserOut, TrustScoreOut
│   │   ├── auth.py              # RegisterRequest, LoginRequest, TokenResponse
│   │   ├── restaurant.py        # RestaurantCreate, RestaurantOut
│   │   ├── menu_item.py         # MenuItemCreate, MenuItemOut
│   │   ├── recommendation.py    # RecommendationCreate, RecommendationOut
│   │   └── feed.py              # FeedItemOut（RecommendationOut + viral 資訊）
│   ├── routers/
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── restaurants.py       # GET 支援 ?q= 名稱搜尋
│   │   ├── menu_items.py
│   │   ├── recommendations.py   # _rec_query() 含完整 selectinload
│   │   └── feed.py              # response_model=list[FeedItemOut]
│   ├── services/
│   │   ├── auth.py              # JWT/bcrypt
│   │   ├── recommendation.py    # redis_lock + trust_score + viral_status
│   │   └── feed.py              # selectinload 修正版（user/restaurant/menu_item）
│   └── dependencies/
│       └── auth.py              # get_current_user（JWT + Redis blacklist + selectinload）
├── tests/                       # 11 tests 全通過（SQLite in-memory + redis mock）
├── alembic/
├── alembic.ini
├── docker-compose.yml           # Redis 7 alpine
├── Dockerfile
├── railway.toml
├── pytest.ini
├── requirements.txt
└── .env / .env.example
```

---

## 8. 前端檔案結構（UI + API 串接完成 ✅）

```
eatsgood/
├── app/
│   ├── globals.css          # CSS 變數（Light / Dark）+ Tailwind 指令
│   ├── layout.tsx           # FOUC 防閃爍腳本（<script dangerouslySetInnerHTML />）
│   │                        # + ThemeProvider + AuthProvider
│   └── page.tsx             # 主頁面：mount 時抓 /feed/trending，失敗 fallback mock
├── components/
│   ├── Nav.tsx              # Sticky + 毛玻璃 + avatar_url null fallback（首字母）
│   │                        # + async logout
│   ├── Hero.tsx             # Viral Showcase 大圖 + 信任密度進度條
│   ├── FeedGrid.tsx         # 響應式 1~4 欄格線
│   ├── DishCard.tsx         # next/image (fill + sizes) + Auth Guard
│   ├── DishModal.tsx        # Spring 動畫 + 左圖右文 + 互動按鈕
│   ├── TrustDensity.tsx     # 進度條 + Avatar 堆疊
│   ├── FilterRail.tsx       # Hashtag chip 過濾 Feed
│   ├── SearchBar.tsx        # 全屏搜尋 Overlay
│   ├── RecommendModal.tsx   # 三步驟推薦表單（接真實 API）
│   │                        # Step1: 搜尋 /restaurants?q= (debounce 300ms)
│   │                        # Step2: 品項名稱 + 照片（本地預覽）
│   │                        # Step3: caption → POST /recommendations
│   │                        # onSubmitSuccess → 即時插入 Feed 頂部
│   ├── AuthModal.tsx        # Email 登入 / 註冊雙 Tab 表單（接真實 API）
│   │                        # Google / LINE 標示「即將推出」
│   └── ThemeToggle.tsx      # 深色模式切換
├── context/
│   ├── AuthContext.tsx      # 真實 JWT auth（loginWithEmail / registerWithEmail / logout）
│   │                        # mount 時自動恢復登入（getToken → /users/me）
│   └── ThemeContext.tsx     # dark/light + localStorage
├── hooks/
│   └── useScrollLock.ts
└── lib/
    ├── api.ts               # ✅ 新建：fetch wrapper + token 管理（localStorage）
    │                        # apiLogin / apiRegister / apiLogout / apiGetMe
    │                        # apiGetTrendingFeed / apiGetViralFeed / apiSearchFeed
    │                        # apiSearchRestaurants / apiCreateRestaurant
    │                        # apiCreateRecommendation
    ├── types.ts             # TypeScript 型別定義（前端用）
    └── mockData.ts          # 8 筆 mock 推薦（後端無資料時 fallback）
```

---

## 9. 前後端串接現況

| 功能 | 狀態 |
|---|---|
| Email 登入 / 註冊 | ✅ 串接（/auth/login + /auth/register） |
| JWT token 儲存 | ✅ localStorage，mount 自動恢復 |
| 登出 | ✅ /auth/logout（清除 Redis 黑名單） |
| Feed 首頁 | ✅ /feed/trending，後端離線自動 fallback mock |
| 餐廳搜尋（推薦表單） | ✅ /restaurants?q=（debounce 300ms） |
| 新增餐廳 | ✅ POST /restaurants（需登入） |
| 提交推薦 | ✅ POST /recommendations（需登入 + Redis） |
| Google / LINE OAuth | ❌ 後端預留 501，前端 UI 標示「即將推出」 |
| 圖片上傳（R2） | ❌ 前端本地預覽，尚未上傳 |
| 搜尋欄（SearchBar） | ⚠️ 目前搜尋 mock data，未串接 /feed/search |
| 互動（Like / Save / Me Too） | ⚠️ UI 按鈕存在，API 尚未串接 |
| 用戶個人頁面 | ❌ 尚未建立 |

---

## 10. 已知 Bug / 技術細節

- `next.config.ts` 的 `experimental.turbo` 會有 TS2353 error（Next.js 版本相容問題，不影響運行）
- `index.css` 在 VSCode 顯示 `@theme` unknown rule 警告（Tailwind 語法，非真實錯誤）
- `dangerouslySetInnerHTML` 必須是 `<script />` 的 **JSX prop**，不能放在子節點內
- feed service 的 `selectinload` 鏈：
  ```python
  .options(
    selectinload(Recommendation.user).selectinload(User.trust_score),
    selectinload(Recommendation.restaurant),
    selectinload(Recommendation.menu_item),
  )
  ```

---

## 11. 吃貨等級計算邏輯（已實作）

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

## 12. 下一步優先清單

### 高優先（功能完整性）
- [ ] `SearchBar.tsx` 接真實 `/feed/search?q=`（目前搜尋 mock data）
- [ ] 互動按鈕串接：`/recommendations/{id}/like`、`/save`、`/me-too`
- [ ] `next.config.ts` 加 `images.remotePatterns`（Unsplash / pravatar / R2 domain）
- [ ] 登入後 RecommendModal 若未登入，跳轉 AuthModal（目前直接觸發 openAuthModal）

### 中優先（功能擴充）
- [ ] 用戶個人頁面 `/profile/[id]`（顯示 trust_score + 歷史推薦）
- [ ] Cloudflare R2 圖片上傳（boto3 已在 requirements，後端 route 待建）
- [ ] Hero 接真實 `/feed/viral`（目前還是 MOCK_VIRAL_ITEM）
- [ ] 推薦表單 Step2 完成後建立 menu_item（`POST /restaurants/{id}/menu-items`）

### 低優先（部署 / OAuth）
- [ ] Google / LINE OAuth（後端 501 預留位，需填 Client ID/Secret）
- [ ] Vercel 部署（前端）
- [ ] Railway 部署（後端 + PostgreSQL）

---

*最後更新：2026-04-27 | 由 Claude Sonnet 4.6 生成*
