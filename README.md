# 房間預訂系統

一個基於React的琴房管理系統，提供直觀的用戶界面來查看琴房信息。

## 功能特色

### 首頁 (/)

- 顯示所有可用房間的列表
- 每個房間卡片包含名稱、容量、價格、描述等信息
- 直接從首頁進行房間預訂

### 預訂頁面 (/booking/:roomId)

- 互動式日曆選擇預訂日期
- 時段選擇（上午、下午、晚上）
- 多時段選擇和預訂表單
- 費用計算和清潔費顯示

### 我的預訂 (/my-bookings)

- 左右分欄設計：左側用戶信息，右側預訂記錄
- 顯示用戶儲值餘額和統計信息
- 預訂卡片包含時段詳情和操作按鈕

### 收益分析 (/revenue-analysis)

- 基於房間配置的收益預估計算
- 考慮租用率和清潔費的詳細分析
- 提供收益優化建議

### 登入頁面 (/login)

- Google 登入和 Email 登入
- 響應式設計，支援手機和桌面

## 技術棧

- **前端框架**: React 18
- **路由管理**: React Router v6
- **構建工具**: Vite
- **樣式框架**: Tailwind CSS
- **圖標**: Heroicons (SVG)

## 快速開始

### 安裝依賴

```bash
npm install
```

### 啟動開發服務器

```bash
npm run dev
```

項目將在 `http://localhost:3000` 啟動

### 構建生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 項目結構

```
src/
├── components/          # 可重用組件
│   ├── Navigation.jsx  # 導航組件
│   ├── RoomCard.jsx    # 房間卡片組件
│   ├── BookingModal.jsx # 預訂彈窗組件
│   ├── TimeSlotButton.jsx # 時段按鈕組件
│   └── RevenueCalculator.jsx # 收益計算器組件
├── pages/              # 頁面組件
│   ├── Home.jsx        # 首頁（房間列表）
│   ├── Booking.jsx     # 預訂頁面
│   ├── MyBookings.jsx  # 我的預訂頁面
│   ├── Login.jsx       # 登入頁面
│   └── RevenueAnalysis.jsx # 收益分析頁面
├── constants/           # 常數定義
│   └── index.js        # 所有常數
├── App.jsx             # 主應用組件
├── main.jsx            # 應用入口
└── index.css           # 全局樣式
```

## 頁面說明

### 首頁 (/)

- 系統歡迎信息
- 主要功能特性展示
- 漸變背景和卡片式佈局

### 房間列表 (/rooms)

- 顯示琴房信息
- 琴房狀態（可預約/已預訂）
- 費用和設備信息
- 響應式單列佈局

### 我的預訂 (/my-bookings)

- 個人預訂記錄
- 預訂狀態管理
- 取消和確認操作
- 卡片式佈局設計

## 設計特色

- **Tailwind CSS**: 使用實用優先的CSS框架
- **響應式設計**: 支持移動端、平板和桌面端
- **現代化UI**: 圓角、陰影、漸變等現代設計元素
- **圖標系統**: 使用Heroicons SVG圖標
- **色彩系統**: 一致的主題色彩和狀態色彩

## 開發說明

- 使用React Hooks管理狀態
- 完全基於Tailwind CSS的樣式系統
- 組件化架構
- 路由保護（可擴展）
- 熱重載開發體驗

## 瀏覽器支持

- Chrome (推薦)
- Firefox
- Safari
- Edge

## 許可證

MIT License
