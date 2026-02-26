---
trigger: always_on
---

# Technology Stack Rules

이 프로젝트에서 사용하는 핵심 기술 스택과 그에 따른 개발 규칙입니다.

## 1. Core Framework: Next.js (App Router)
- **버전**: 최신 안정 버전 (Stable) 사용.
- **라우팅**: App Router 기반의 파일 시스템 라우팅 사용.
- **컴포넌트**: 기본적으로 **Server Components** 사용, 필요 시 Client Component (`'use client'`) 최소화.
- **이미지**: `next/image`를 사용하여 이미지 최적화 필수.

## 2. Backend & Database: Supabase
- **인증 (Auth)**:
    - Supabase Auth를 사용하여 회원가입/로그인 구현.
    - SSR 환경에서의 세션 관리를 위해 `@supabase/ssr` 패키지 사용 권장.
    - 미들웨어(`middleware.ts`)에서 세션 유효성 검사 및 리다이렉트 처리.
- **데이터베이스 (DB)**:
    - 모든 테이블은 **PostgreSQL** 기반.
    - **RLS (Row Level Security)** 정책을 반드시 설정하여 데이터 접근 제어.
    - 클라이언트에서 직접 DB 접근 시, `supabase-js` 클라이언트 활용.
- **타입 생성**:
    - Supabase CLI를 사용하여 DB 스키마로부터 TypeScript 타입을 자동 생성 (`database.types.ts`).
    - 수동 타입 정의보다 자동 생성된 타입을 우선 사용.

## 3. Styling: Tailwind CSS
- **유틸리티 클래스 우선**: 별도의 CSS 파일 생성보다는 Tailwind 유틸리티 클래스 사용을 원칙으로 함.
- **커스텀 설정**: 색상, 폰트 등 프로젝트 고유의 디자인 토큰은 `tailwind.config.ts`에 정의하여 사용.
- **조건부 스타일링**: `clsx` 또는 `tailwind-merge` 라이브러리를 사용하여 클래스 충돌 방지 및 조건부 적용.
- **아이콘**: `lucide-react`와 같은 SVG 아이콘 라이브러리 사용 권장.

## 4. State Management
- **서버 상태**: `React Query` (TanStack Query) 또는 Next.js의 native fetch caching 활용.
- **클라이언트 상태**:
    - 지역 상태(Local State): `useState`, `useReducer`.
    - 전역 상태(Global State): `Zustand` 사용 권장 (가볍고 사용하기 쉬움).
    - 복잡한 로직이 없는 경우 Context API 사용 자제 (불필요한 리렌더링 방지).

## 5. Form Handling
- **React Hook Form**: 폼 상태 관리 및 유효성 검사 라이브러리.
- **Zod**: 스키마 기반 유효성 검증. React Hook Form과 `zodResolver`로 연동하여 타입 안전성 확보.

## 6. Testing (Optional but Recommended)
- **Unit Test**: Vitest + React Testing Library.
- **E2E Test**: Playwright.
