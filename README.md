## Memegen - [Meme Generator](https://www.memegen.live/)

A web-based meme generator inspired by [9GAG Meme Generator](https://meme.9gag.com/meme-generator).

---

# 밈 제너레이터 (Memegen)

9GAG 스타일의 웹 기반 밈 제작 도구

9GAG 밈 제너레이터에서 영감을 받아 시작한 프로젝트로, 밈 템플릿을 선택하거나 직접 이미지를 업로드하여 텍스트 레이어를 추가·편집하고 PNG로 다운로드할 수 있는 웹앱이다.

## 주요 모듈

- Next.js (App Router, 웹 프레임워크)
- TypeScript (타입 안전성)
- Tailwind CSS + shadcn/ui (UI 컴포넌트)
- Konva.js + react-konva (캔버스 렌더링 — 레이어 선택, 변형, 드래그/리사이즈)
- Zustand (전역 상태 관리)
- @dnd-kit/core + @dnd-kit/sortable (레이어 패널 드래그 정렬)
- react-color (텍스트 색상, 외곽선, 그림자 색상 선택기)

## 앱 흐름

1. **랜딩**: 빈 캔버스 + 왼쪽 패널에 밈 템플릿 그리드 표시
2. **템플릿 선택**: 썸네일 클릭 시 템플릿 이미지가 잠긴 이미지 레이어로 캔버스에 로드되고, 사전 정의된 텍스트 레이어가 자동 생성됨. 템플릿 이름/설명이 그리드 아래에 표시됨
3. **레이어 편집**: 캔버스 위의 텍스트 레이어를 클릭하여 선택 → 바운딩 박스(8개 리사이즈 핸들) 표시. 드래그로 이동, 핸들로 리사이즈, 더블클릭으로 인라인 텍스트 편집 (textarea 오버레이 방식)
4. **스타일 편집**: 오른쪽 패널에서 폰트, 크기, 색상, 외곽선, 그림자, 정렬 등 텍스트 속성 조정. 퀵 스타일 프리셋 (Classic Meme, Bold Shadow, Neon Glow 등) 제공
5. **레이어 관리**: 오른쪽 레이어 패널에서 드래그로 순서 변경, 가시성/잠금 토글, 레이어 삭제
6. **내보내기**: "Finish" 버튼 클릭 → 캔버스를 단일 이미지로 병합하여 PNG 다운로드

## 레이아웃 구조

세 개의 컬럼으로 구성된 전체 뷰포트 높이 레이아웃 (다크 테마):

```
[ 왼쪽 패널 ~280px ] [ 캔버스 영역 flex-1 ] [ 오른쪽 패널 ~280px ]
```

- **왼쪽 패널**: 템플릿 검색, 썸네일 그리드, 이미지 업로드
- **가운데**: 툴바 (텍스트 추가, 미디어 추가, 실행 취소/다시 실행, 자르기) + Konva 캔버스. 캔버스 위아래의 `+` 버튼으로 수직 여백(80px) 추가 가능
- **오른쪽 패널**: Finish 버튼, 레이어 카드, 속성 카드 (텍스트/이미지 레이어 속성)

## 테스트

```bash
pnpm test        # 단위/통합 테스트 (Jest + React Testing Library)
pnpm test:e2e    # E2E 테스트 (Playwright)
```

- **단위 테스트** (`src/__tests__/`): Jest + React Testing Library — 템플릿 데이터 유효성, Zustand 스토어 액션 (레이어 추가/삭제/수정/정렬/선택)
- **E2E 테스트** (`e2e/`): Playwright (Chromium) — 갤러리 페이지 및 에디터 페이지의 주요 UI 요소와 네비게이션 동작 검증

---

# Meme Generator (Memegen)

A web-based meme creation tool inspired by 9GAG Meme Generator

A project inspired by the 9GAG Meme Generator. Users can pick a meme template or upload their own image, add and edit text layers, and download the finished meme as a PNG.

## Key Modules

- Next.js (App Router, web framework)
- TypeScript (type safety)
- Tailwind CSS + shadcn/ui (UI components)
- Konva.js + react-konva (canvas rendering — layer selection, transformation, drag/resize)
- Zustand (global state management)
- @dnd-kit/core + @dnd-kit/sortable (drag-to-reorder in the Layers panel)
- react-color (color pickers for text color, stroke, and shadow)

## App Flow

1. **Landing**: Blank canvas with a meme template grid visible in the left panel
2. **Template selection**: Click a thumbnail → template image loads as a locked Image layer on canvas, pre-defined text layers are created automatically. Template name/description appears below the grid
3. **Layer editing**: Click a text layer on canvas to select it → bounding box with 8 resize handles appears. Drag to move, drag handles to resize, double-click to enter inline text editing (textarea overlay)
4. **Style editing**: Adjust font, size, color, stroke, shadow, and alignment in the right panel. Quick Style presets available (Classic Meme, Bold Shadow, Neon Glow, etc.)
5. **Layer management**: Reorder layers via drag handle in the Layers panel, toggle visibility/lock, delete text layers
6. **Export**: Click "Finish" → canvas is flattened and downloaded as a PNG

## Layout Structure

Three-column full-viewport-height layout (dark theme):

```
[ Left Pane ~280px ] [ Canvas Area flex-1 ] [ Right Pane ~280px ]
```

- **Left pane**: Template search, thumbnail grid, image upload
- **Center**: Toolbar (Add Text, Add Media, Undo, Redo, Crop) + Konva canvas. `+` buttons above and below the canvas add 80px of vertical padding
- **Right pane**: Finish button, Layers card, Properties card (text and image layer properties)

## Testing

```bash
pnpm test        # Unit tests (Jest + React Testing Library)
pnpm test:e2e    # End-to-end tests (Playwright)
```

- **Unit tests** (`src/__tests__/`): Jest + React Testing Library — template data validation, Zustand store actions (add/remove/update/reorder/select layers)
- **E2E tests** (`e2e/`): Playwright (Chromium) — key UI elements and navigation on the gallery and editor pages
