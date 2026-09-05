# MilkyWay · 은하수책방 — Legacy Maintenance & Contribution Case Study

> Java/JSP/MySQL 기반 온라인 서점 팀 프로젝트에서 제가 담당한 기능과 협업 이력을 원본 Git 기록에 연결하고, 현재 기준의 보안 정리와 단계적 현대화 전략까지 정리한 공개 Case Study입니다.

## Project at a glance

- **Type:** Team project / supporting portfolio case
- **Original development:** 2024.09–2024.10
- **Original repository:** [fullstackteampj/MillkyWay](https://github.com/fullstackteampj/MillkyWay)
- **GitHub account:** `Kzone87`
- **Working branch:** `junghoon`
- **Merged PRs authored by Kzone87:** 20
- **Stack:** Java, JSP, Servlet, MySQL, JavaScript, Gson, Naver Open API, Tomcat

이 저장소는 팀 프로젝트 전체 소스를 제 개인 작업물처럼 복제하지 않습니다. 원본 Git 이력에서 확인되는 **개인 기여, 협업 경험, 유지보수 판단**만 기록합니다.

## Why this case study remains in the portfolio

이 프로젝트의 역할은 최신 기술 대표작이 아닙니다. 다음과 같은 외주 유지보수 역량을 보조하는 증거입니다.

- 기존 Java/JSP/Servlet/JDBC 코드 이해
- 인증·회원·주문·취소처럼 연결된 업무 상태 처리 경험
- 외부 API와 내부 DB가 함께 있는 시스템 이해
- 팀 Git branch / PR 협업
- 과거 구현의 보안 문제를 현재 기준으로 다시 평가
- 전면 재개발보다 위험을 낮추는 단계적 현대화 계획

최신 풀스택 신규 개발 증거는 별도의 공개 프로젝트에서 담당하고, MilkyWay는 **legacy maintenance / modernization** 범위를 담당합니다.

## Contribution evidence index

| Area | Verified PR evidence |
| --- | --- |
| 도서 검색 / 외부·내부 검색 흐름 | [PR #1](https://github.com/fullstackteampj/MillkyWay/pull/1) |
| 장바구니 ↔ 위시리스트 / 검색 UI | [PR #5](https://github.com/fullstackteampj/MillkyWay/pull/5) |
| 비밀번호 hash + 사용자별 salt | [PR #7](https://github.com/fullstackteampj/MillkyWay/pull/7), [#9](https://github.com/fullstackteampj/MillkyWay/pull/9), [#11](https://github.com/fullstackteampj/MillkyWay/pull/11) |
| Naver 로그인 / 회원·마이페이지 | [PR #23](https://github.com/fullstackteampj/MillkyWay/pull/23) |
| 관리자 / 주문취소 / 회원 상태 | [PR #33](https://github.com/fullstackteampj/MillkyWay/pull/33) |
| Tomcat 10 / Jakarta Servlet 전환 | [PR #43](https://github.com/fullstackteampj/MillkyWay/pull/43) |
| 2026 legacy security hardening | [PR #49](https://github.com/fullstackteampj/MillkyWay/pull/49) |

> PR #49는 2024년 팀 개발 당시 기여와 구분되는 **2026년 유지보수/보안 정리 작업**입니다.

## Service overview

MilkyWay는 도서 검색, 회원 인증, 장바구니/위시리스트, 주문, 마이페이지, 게시판, 관리자 기능 등을 포함한 온라인 서점 서비스입니다.

```text
Browser
  │
  ├─ JSP / JavaScript
  │
  ├─ Servlet request handling
  │
  ├─ Manager classes + JDBC
  │       │
  │       └─ MySQL
  │
  └─ Naver Open API
       ├─ Book search
       └─ Social login
```

## Verified contribution

### 1. 도서 검색

- Naver Book Search API를 Servlet endpoint와 연결
- JSON 검색 결과 반환
- 내부 도서 DB 검색 Servlet 구현
- 제목/저자/카테고리 조건 MySQL 조회
- Gson JSON 변환

**Evidence:** [PR #1](https://github.com/fullstackteampj/MillkyWay/pull/1)

### 2. 인증과 비밀번호 처리

- `SecureRandom` salt 생성
- 당시 SHA-256 + 사용자별 salt 방식으로 비밀번호 검증 흐름 개선
- 비밀번호 변경 시 새 salt와 hash 저장

**Evidence:** [PR #7](https://github.com/fullstackteampj/MillkyWay/pull/7), [#9](https://github.com/fullstackteampj/MillkyWay/pull/9), [#11](https://github.com/fullstackteampj/MillkyWay/pull/11)

신규 시스템이라면 이 직접 구현을 그대로 사용하지 않고 Spring Security와 Argon2id/bcrypt 계열 password hashing을 사용합니다. 과거 구현과 현재 판단을 구분하기 위해 기록을 유지합니다.

### 3. 장바구니 / 위시리스트

- 장바구니 항목을 위시리스트로 이동
- 위시리스트 항목을 장바구니로 이동
- 대상 INSERT 후 원본 제거 흐름 구현

**Evidence:** [PR #5](https://github.com/fullstackteampj/MillkyWay/pull/5)

현재 기준에서는 여러 SQL이 하나의 작업을 구성하므로 service transaction으로 묶는 것이 적절합니다.

### 4. 마이페이지 / 주문 취소 / 회원 상태

- 회원정보 조회·수정
- 비밀번호 확인 흐름
- 구매내역 주문 식별자/수량 처리
- 취소 요청 데이터 이동
- 취소 목록 가격·수량 및 회원 탈퇴 상태 처리

**Evidence:** [PR #23](https://github.com/fullstackteampj/MillkyWay/pull/23), [#33](https://github.com/fullstackteampj/MillkyWay/pull/33)

### 5. Naver 로그인

- Naver 사용자 JSON parsing
- 기존 가입 여부 확인
- 내부 사용자 조회 / 신규 소셜 사용자 등록
- 소셜/일반 사용자 마이페이지 분기

**Evidence:** [PR #23](https://github.com/fullstackteampj/MillkyWay/pull/23)

### 6. 관리자 / routing

- 관리자 로그인 흐름 보완
- `/admin/*` Servlet routing
- 사용자 상태 및 마지막 로그인 처리
- 관리자/마이페이지 통합 과정의 데이터 연결

**Evidence:** [PR #33](https://github.com/fullstackteampj/MillkyWay/pull/33)

### 7. Tomcat 10 / Jakarta Servlet

Servlet import를 `javax.servlet.*`에서 `jakarta.servlet.*`로 변경해 Tomcat 10 계열 환경에 맞추는 작업에 참여했습니다.

**Evidence:** [PR #43](https://github.com/fullstackteampj/MillkyWay/pull/43)

## Collaboration evidence

원본 GitHub 기록에서 `Kzone87` 계정으로 생성된 병합 PR이 20개 확인됩니다. 일부는 branch 동기화용이므로 위 표와 설명에서는 실제 diff에서 기능 구현이 확인되는 PR만 기능 증거로 사용합니다.

경험한 협업 방식:

- 개인 feature branch
- PR 기반 `main` 병합
- 팀 변경사항 branch 동기화
- conflict 해결
- DB schema와 JSP/Java 변경을 포함한 기능 단위 통합

## 2026 security hardening

2026-09-05 원본 팀 저장소의 현재 `main`을 대상으로 보안 정리를 수행했습니다.

- 하드코딩 credential을 환경변수 기반 설정으로 이동
- OAuth `state` 검증 추가
- access/refresh token 및 사용자 profile debug 출력 제거
- tracked `build/` 및 backup ZIP 제거
- `.env` / secret ignore 정책 추가
- 당시 사용하던 Naver application 폐기

**Evidence:** [Security hardening PR #49](https://github.com/fullstackteampj/MillkyWay/pull/49)

과거 Git 이력은 협업/기여 기록 보존을 위해 유지하지만 현재 연결 구조에는 실제 credential을 사용하지 않습니다.

## Modernization plan

과거 코드를 단순히 “Spring Boot로 다시 작성하겠다”는 수준에서 끝내지 않고, 실제 운영 중인 legacy 시스템이라고 가정한 단계적 계획을 별도 문서로 정리했습니다.

**[Legacy Modernization Plan](./MODERNIZATION-PLAN.md)**

핵심 원칙:

```text
credential 위험 제거
        ↓
characterization tests
        ↓
transaction 경계
        ↓
service / repository 책임 분리
        ↓
명시적 state model
        ↓
Spring Security / OAuth 현대화
        ↓
기능별 incremental Spring Boot migration
        ↓
legacy route 제거
```

전면 rewrite로 한 번에 교체하지 않고, 테스트·transaction·rollback 기준을 확보한 뒤 변경이 필요한 기능부터 점진적으로 대체하는 전략입니다.

## What this proves for maintenance work

이 사례를 통해 보여주려는 것은 오래된 프레임워크 사용 경험 자체가 아닙니다.

- 기존 코드의 업무 의미를 먼저 파악하는 능력
- 보안과 데이터 무결성 문제의 우선순위 판단
- 여러 SQL로 구성된 상태 변경의 transaction 필요성 인식
- 문자열 상태를 명시적인 state model로 바꾸는 판단
- 현재 동작을 테스트로 고정한 뒤 변경하는 접근
- 기존 시스템을 무조건 버리지 않는 migration 전략
- 실제 Git 증거와 개인 기여 범위를 구분하는 태도

---

이 저장소는 **개인 기여 및 legacy maintenance Case Study**이며 MilkyWay 전체 프로젝트의 단독 제작을 주장하지 않습니다.
