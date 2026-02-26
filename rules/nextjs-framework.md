---
trigger: always_on
---

# Next.js Framework Rules

이 프로젝트에서 따르는 Next.js 및 React 개발 원칙입니다.

## 1. Core Principles (핵심 원칙)

### 1.1 Server Components First (서버 컴포넌트 우선)
- **기본값은 서버 컴포넌트**: 모든 컴포넌트는 기본적으로 서버 컴포넌트로 작성합니다.
- **`'use client'` 최소화**: `useState`, `useEffect`, `onClick` 등 상호작용이 꼭 필요한 경우에만 `'use client'`를 사용합니다.
- **Leaf Client Components**: 클라이언트 컴포넌트는 가능한 컴포넌트 트리의 **말단(Leaf)**으로 밀어내어, 서버 컴포넌트의 이점(번들 사이즈 감소, 초기 로딩 속도 향상)을 극대화합니다.

### 1.2 Clean & Concise Code (간결하고 명확한 코드)
- **가독성 우선**: 코드는 작성하는 시간보다 읽히는 시간이 훨씬 깁니다. 변수명과 함수명은 그 역할을 명확히 설명해야 합니다.
- **Early Return**: 불필요한 `else`나 중첩(Nesting)을 피하기 위해 가드 절(Guard Clauses)과 Early Return 패턴을 적극 사용합니다.
- **단일 책임 원칙 (SRP)**: 하나의 함수나 컴포넌트는 하나의 일만 잘하도록 작성합니다.

### 1.3 Modularization (모듈화)
- **파일 분리 기준**: 하나의 파일이 너무 커지거나(예: 150~200줄 이상) 여러 논리적 관심사가 섞여 있다면, 반드시 작은 컴포넌트나 훅(Hook)으로 분리합니다.
- **Co-location**: 특정 페이지나 컴포넌트에서만 사용되는 하위 컴포넌트는 해당 폴더 근처에 위치시켜 응집도를 높입니다.

---

## 2. Recommended Best Practices (추천 모범 사례)

### 2.1 Performance Optimization (성능 최적화)
- **이미지 최적화**: 표준 `<img>` 태그 대신 Next.js의 `<Image />` 컴포넌트를 사용하여 자동 리사이징 및 포맷 최적화를 수행합니다.
- **폰트 최적화**: `next/font`를 사용하여 CLS(Layout Shift)를 방지합니다.
- **동적 로딩**: 무거운 컴포넌트는 `next/dynamic`을 사용해 Lazy Loading을 적용합니다.

### 2.2 Data Fetching (데이터 패칭)
- **서버 단에서 Fetching**: 가능한 한 클라이언트(`useEffect`)가 아닌 서버 컴포넌트에서 `await fetch()`로 데이터를 가져옵니다.
- **병렬 요청**: 서로 의존성이 없는 데이터 요청은 `Promise.all` 등을 사용하여 병렬로 처리해 응답 시간을 단축합니다.

### 2.3 UX Implementation (사용자 경험)
- **Loading UI**: `loading.tsx` 또는 `<Suspense fallback={...}>`를 사용하여 데이터 로딩 중에도 사용자에게 반응형 UI를 제공합니다.
- **Error Handling**: `error.tsx`를 구현하여 런타임 에러 발생 시 전체 앱이 멈추지 않고, 우아하게 복구하거나 대체 화면을 보여줍니다.
- **Metadata 활용**: SEO를 위해 Layout이나 Page 파일에서 `export const metadata`를 적극 활용합니다.

### 2.4 Project Structure (구조)
- **Clean Architecture 준수**: 비즈니스 로직은 `domain`, 데이터 처리는 `data`, UI는 `presentation` 혹은 `app` 폴더로 철저히 분리하여 의존성을 관리합니다.

---

## 3. Code Style Example

```tsx
// ❌ Avoid: Client Component for simple rendering, Deep nesting, Generic naming
'use client';
export default function List({ d }: { d: any }) {
  return (
    <div>
      {d && d.length > 0 ? (
        d.map((i: any) => (
           <div key={i.id}>{i.name}</div>
        ))
      ) : (
        <div>No Data</div>
      )}
    </div>
  );
}

// ✅ Recommended: Server Component, Clear Naming, Early Return
// app/products/product-list.tsx
export default function ProductList({ products }: { products: Product[] }) {
  if (!products || products.length === 0) {
    return <EmptyState message="등록된 상품이 없습니다." />;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} data={product} />
      ))}
    </div>
  );
}
```
