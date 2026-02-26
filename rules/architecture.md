---
trigger: always_on
---

# 클린 아키텍처 가이드 (Clean Architecture Guide)

이 문서는 `shop-dashboard` 프로젝트에 적용할 클린 아키텍처의 개념과 폴더 구조를 상세히 설명합니다.

## 핵심 원칙 (Core Principles)

1.  **의존성 규칙 (Dependency Rule)**: 소스 코드 의존성은 반드시 **안쪽(고수준 정책)**으로만 향해야 합니다. 안쪽의 원(Domain)은 바깥쪽의 원(Data, UI)에 대해 아무것도 몰라야 합니다.
2.  **관심사의 분리 (Separation of Concerns)**: 소프트웨어를 계층(Layer)으로 나누어 각 계층이 하나의 역할만 수행하도록 합니다.

---

## 계층별 상세 설명 (Layer Details)

이 프로젝트는 크게 3가지 주요 계층으로 나뉩니다.

### 1. 도메인 계층 (`domain/`) - 가장 안쪽 원
비즈니스 로직의 핵심입니다. 프레임워크(React, Next.js)나 외부 라이브러리에 전혀 의존하지 않는 순수한 TypeScript 코드로 작성됩니다.

*   **Entities (`domain/entities/`)**:
    *   전사적 비즈니스 규칙을 담은 핵심 데이터 모델입니다.
    *   예: `Product`, `Order`, `User` 인터페이스나 클래스.
*   **Use Cases (`domain/use-cases/`)**:
    *   애플리케이션 고유의 비즈니스 규칙을 구현합니다.
    *   "상품 목록 조회", "주문 생성" 등의 구체적인 동작을 정의합니다.
*   **Repositories (`domain/repositories/`)**:
    *   데이터 접근을 위한 **인터페이스(계약)**만 정의합니다. 구현은 하지 않습니다.
    *   도메인 계층은 "데이터가 필요하다"는 것만 알지, "어떻게 가져오는지(API, DB)"는 모릅니다.

### 2. 데이터 계층 (`data/`) - 중간 원 (어댑터)
도메인 계층의 인터페이스를 실제로 구현하고, 외부 데이터 소스와 통신하는 역할을 합니다.

*   **Repositories (`data/repositories/`)**:
    *   도메인 계층의 Repository 인터페이스를 구현(implements)합니다.
    *   예: `ProductRepositoryImpl` (API에서 데이터를 가져와 도메인 Entity로 변환하여 반환).
*   **Data Sources (`data/sources/`)**:
    *   실제 데이터 소스와의 통신을 담당합니다.
    *   예: `ExampleApi`, `LocalStorageManager`.
*   **DTOs (`data/dtos/`)**:
    *   API 응답값 등 외부 데이터 형식을 그대로 정의한 타입입니다.
    *   도메인 Entity와 형태가 다를 수 있으므로, 매퍼(Mapper)를 통해 변환이 필요합니다.

### 3. 프레젠테이션 계층 (`presentation/` & `app/`) - 가장 바깥쪽 원
사용자에게 데이터를 보여주고 상호작용을 처리합니다. Next.js와 React가 주로 이곳에 위치합니다.

*   **Components (`presentation/components/`)**:
    *   재사용 가능한 UI 컴포넌트입니다.
*   **Hooks (`presentation/hooks/`)**:
    *   ViewModel 역할을 수행합니다. Use Case를 호출하고 상태를 관리합니다.
*   **Styles (`presentation/styles/`)**:
    *   전역 스타일이나 디자인 시스템 정의.
*   **App (`app/`)**:
    *   Next.js App Router의 페이지와 레이아웃.
    *   URL 라우팅과 페이지 구성을 담당합니다.

---

## 제안하는 폴더 구조 (Proposed Folder Structure)

```
/
├── app/                  # Next.js Pages & Layouts (UI 진입점)
│   ├── (auth)/           # 인증 관련 페이지 그룹
│   ├── (dashboard)/      # 대시보드 관련 페이지 그룹
│   ├── layout.tsx
│   └── page.tsx
├── core/                 # 공용 유틸리티 및 설정 (Shared Kernel)
│   ├── config/           # 앱 설정 상수
│   ├── errors/           # 커스텀 에러 클래스
│   └── types/            # 공통 타입 정의
├── data/                 # 데이터 구현 계층 (Implementation)
│   ├── sources/          # API/DB 호출 객체
│   ├── repositories/     # Repository 구현체
│   └── dtos/             # API 응답 타입 정의
├── domain/               # 비즈니스 로직 계층 (Pure TS)
│   ├── entities/         # 핵심 모델 (Interface/Class)
│   ├── repositories/     # Repository 인터페이스
│   └── use-cases/        # 비즈니스 로직 단위
├── presentation/         # UI 계층
│   ├── components/       # 공통 UI 컴포넌트
│   ├── hooks/            # 커스텀 훅 (ViewModel)
│   └── styles/           # 스타일 정의
├── public/               # 정적 파일
└── tsconfig.json         # 경로 별칭(@domain, @data 등) 설정 필요
```

---

## 데이터 흐름 예시 (Example Flow)

사용자가 **"상품 목록"**을 보는 경우의 흐름:

1.  **UI (`app/products/page.tsx`)**: 페이지가 로드되면 `useProducts` 훅을 호출합니다.
2.  **Hook (`presentation/hooks/useProducts.ts`)**: `GetProductsUseCase`를 실행합니다.
3.  **Use Case (`domain/use-cases/get-products.ts`)**: `ProductRepository` 인터페이스의 `getProducts()` 메서드를 호출합니다.
4.  **Repository Impl (`data/repositories/product-repository-impl.ts`)**: `ProductApi`를 호출하여 데이터를 가져옵니다.
5.  **Data Source (`data/sources/product-api.ts`)**: 실제 백엔드 API `/api/products`를 호출하여 JSON 응답(DTO)을 받습니다.
6.  **Repository Impl**: 받은 DTO를 `Product` Entity로 변환(Mapping)하여 반환합니다.
7.  **Use Case**: 비즈니스 로직(예: 재고 있는 상품만 필터링)을 수행하고 결과를 반환합니다.
8.  **UI**: 반환된 `Product` 목록을 화면에 렌더링합니다.

---

## 왜 이 구조를 사용하는가?

*   **테스트 용이성**: API 없이도 `ProductRepository`를 가짜(Mock)로 구현하여 비즈니스 로직(Use Case)만 테스트할 수 있습니다.
*   **유지보수성**: API 응답 필드명이 바뀌어도 `data` 계층만 수정하면 됩니다. UI나 도메인 로직은 영향을 받지 않습니다.
*   **확장성**: 프로젝트가 커져도 기능별, 계층별로 코드가 분리되어 있어 관리가 쉽습니다.
