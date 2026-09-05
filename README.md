# MilkyWay · 은하수책방 — Contribution Case Study

> Java/JSP/MySQL 기반 온라인 서점 팀 프로젝트에서 제가 담당한 기능과 협업 이력을 원본 Git 기록에 연결해 정리한 개인 포트폴리오 Case Study입니다.

## Project at a glance

- **Project:** MilkyWay · 은하수책방
- **Type:** Team project
- **Period:** 2024.09–2024.10
- **Original team repository:** [fullstackteampj/MillkyWay](https://github.com/fullstackteampj/MillkyWay)
- **My GitHub account:** `Kzone87`
- **My working branch:** `junghoon`
- **Merged PRs authored by Kzone87:** 20
- **Stack:** Java, JSP, Servlet, MySQL, JavaScript, Gson, Naver Open API, Tomcat

이 저장소는 팀 프로젝트 전체 소스를 제 개인 작업물처럼 복제하지 않습니다. 원본 Git 이력에서 확인되는 **제 기여 범위, 구현 의도, 협업 경험과 현재 기준의 개선 판단**만 정리합니다.

## Contribution evidence index

원본 PR 제목은 당시 개인 브랜치명 중심으로 작성되어 있어 제목만으로 기능을 설명하기 어렵습니다. 아래 표는 실제 diff에서 기능 구현이 확인되는 PR을 기능별로 연결한 것입니다.

| Area | Verified PR evidence |
| --- | --- |
| 도서 검색 / 외부·내부 검색 흐름 | [PR #1](https://github.com/fullstackteampj/MillkyWay/pull/1) |
| 장바구니 ↔ 위시리스트 / 검색 UI 보완 | [PR #5](https://github.com/fullstackteampj/MillkyWay/pull/5) |
| 비밀번호 hash + 사용자별 salt | [PR #7](https://github.com/fullstackteampj/MillkyWay/pull/7), [PR #9](https://github.com/fullstackteampj/MillkyWay/pull/9), [PR #11](https://github.com/fullstackteampj/MillkyWay/pull/11) |
| Naver 로그인 / 회원·마이페이지 상태 | [PR #23](https://github.com/fullstackteampj/MillkyWay/pull/23) |
| 관리자 / 주문취소 / 회원 상태 통합 | [PR #33](https://github.com/fullstackteampj/MillkyWay/pull/33) |
| Tomcat 10 / Jakarta Servlet 전환 | [PR #43](https://github.com/fullstackteampj/MillkyWay/pull/43) |
| 2026 legacy security hardening | [PR #49](https://github.com/fullstackteampj/MillkyWay/pull/49) |

> PR #49는 2024년 팀 개발 당시 기능 기여와 구분되는 **2026년 유지보수/보안 정리 작업**입니다.

## Service overview

MilkyWay는 도서 검색, 회원 인증, 장바구니/위시리스트, 주문, 마이페이지, 게시판, 관리자 기능 등을 포함한 온라인 서점 서비스입니다.

당시 프로젝트는 JSP/Servlet 기반으로 화면과 서버 로직을 연결하고 MySQL에 회원·도서·주문 데이터를 저장하는 구조였습니다. 외부 도서 검색과 소셜 로그인에는 Naver API를 사용했습니다.

```text
Browser
  │
  ├─ JSP / JavaScript
  │
  ├─ Servlet routing / request handling
  │
  ├─ Manager classes + JDBC
  │       │
  │       └─ MySQL
  │
  └─ Naver Open API
       ├─ Book search
       └─ Social login
```

## My contribution

### 1. 도서 검색 흐름

- Naver Book Search API 호출을 Servlet 엔드포인트로 연결
- 검색 결과를 JSON으로 브라우저에 반환
- 내부 도서 DB 검색용 Servlet 구현
- 제목/저자 및 카테고리 조건에 따른 MySQL 조회
- Gson을 이용한 JSON 변환

외부 검색 API와 내부 DB 검색을 별도 경로로 분리해 브라우저가 두 데이터 소스를 사용할 수 있도록 구성했습니다.

**Evidence:** [original PR #1](https://github.com/fullstackteampj/MillkyWay/pull/1)

### 2. 비밀번호 hash + 사용자별 salt

- `SecureRandom`을 사용한 salt 생성
- 비밀번호와 salt를 결합해 SHA-256 hash 생성
- 로그인 시 저장된 salt를 조회해 입력 비밀번호 검증
- 비밀번호 변경 시 새 salt를 생성하고 hash와 함께 저장
- 평문 비밀번호 비교 흐름을 hash 검증 흐름으로 변경

**Evidence:** [PR #7](https://github.com/fullstackteampj/MillkyWay/pull/7), [PR #9](https://github.com/fullstackteampj/MillkyWay/pull/9), [PR #11](https://github.com/fullstackteampj/MillkyWay/pull/11)

> 현재 신규 인증 시스템을 설계한다면 직접 SHA-256을 조합하지 않고 Argon2id, bcrypt 또는 scrypt 같은 password hashing KDF와 검증된 인증 라이브러리를 사용합니다. 이 항목은 당시 구현 경험과 이후 보안 판단의 발전을 함께 보여주기 위해 남깁니다.

### 3. 장바구니 / 위시리스트 상태 이동

- 장바구니 항목을 위시리스트로 이동
- 위시리스트 항목을 장바구니로 이동
- 기존 레코드를 조회하고 대상 테이블에 삽입한 뒤 원본을 제거하는 흐름 구현
- 검색/장바구니 관련 사용자 흐름 보완

**Evidence:** [original PR #5](https://github.com/fullstackteampj/MillkyWay/pull/5)

### 4. 마이페이지와 주문 취소

- 회원정보 조회/수정 범위 확장
- 사용자 상태와 상세주소 처리
- 비밀번호 확인 로직 연결
- 구매내역의 주문 식별자와 수량 처리
- 취소 요청 정보를 별도 취소 데이터로 이동하는 흐름 구현
- 취소 목록의 가격·수량 정보 및 회원 탈퇴 상태 처리

**Evidence:** [PR #23](https://github.com/fullstackteampj/MillkyWay/pull/23), [PR #33](https://github.com/fullstackteampj/MillkyWay/pull/33)

### 5. Naver 로그인 연동

- Naver 사용자 JSON 응답 파싱
- 기존 가입 여부 확인
- Naver 계정 식별자를 기준으로 내부 사용자 조회
- 신규 소셜 사용자 등록
- 소셜 로그인 사용자와 일반 로그인 사용자의 마이페이지 표시 분기

**Evidence:** [original PR #23](https://github.com/fullstackteampj/MillkyWay/pull/23)

### 6. 관리자 및 라우팅

- 관리자 로그인 흐름 보완
- `/admin/*` 요청을 JSP 화면으로 연결하는 Servlet 라우팅 추가
- 사용자 상태 및 마지막 로그인 일자 처리
- 관리자/마이페이지 기능 통합 과정의 화면·데이터 연결 보완

**Evidence:** [original PR #33](https://github.com/fullstackteampj/MillkyWay/pull/33)

### 7. Tomcat 10 / Jakarta Servlet 전환

프로젝트 후반에는 Servlet import를 `javax.servlet.*`에서 `jakarta.servlet.*`로 변경해 Tomcat 10 계열 환경에 맞추는 작업에도 참여했습니다.

**Evidence:** [original PR #43](https://github.com/fullstackteampj/MillkyWay/pull/43)

## Collaboration evidence

원본 GitHub 기록상 `Kzone87` 계정으로 생성된 병합 PR이 **20개** 확인됩니다. 일부는 `main ↔ junghoon` 브랜치 동기화용이므로, 위 Contribution 항목에서는 실제 diff에서 기능 구현이 확인되는 PR만 선별했습니다.

이 프로젝트에서 경험한 협업 방식은 다음과 같습니다.

- 기능별 개인 브랜치 사용
- 작업 내용을 `main`으로 PR 병합
- 팀원 변경사항을 개인 브랜치로 다시 동기화
- 충돌 해결 후 기능 통합
- DB 스키마와 JSP/Java 코드가 함께 변경되는 기능 단위 작업

## What I would improve today

1. **Controller / Service / Repository 계층 분리**  
   JSP와 JDBC 중심 로직을 Spring Boot 기반 계층형 구조로 분리합니다.

2. **트랜잭션 적용**  
   장바구니→위시리스트, 구매→취소처럼 여러 SQL이 하나의 상태 전이를 구성하는 작업은 단일 DB transaction으로 묶습니다.

3. **인증 현대화**  
   비밀번호는 Argon2id/bcrypt 계열을 사용하고 세션·OAuth 처리를 검증된 보안 프레임워크에 위임합니다.

4. **Secret 관리**  
   API credential과 DB credential을 환경변수 또는 secret manager로 관리합니다.

5. **SQL/DTO 타입 안정성**  
   문자열 기반 상태값을 명시적 enum/state model로 관리하고 validation을 추가합니다.

6. **자동화된 테스트와 CI**  
   로그인, 주문, 취소, 검색 등 핵심 흐름을 integration test로 검증하고 PR마다 CI를 수행합니다.

## 2026 security hardening

원본 팀 저장소는 과거 학습 프로젝트 특성상 외부 API credential과 개발용 DB credential이 소스 및 Git 이력에 포함된 적이 있습니다.

2026-09-05에 현재 `main` 기준 보안 정리를 수행했습니다.

- 하드코딩 credential을 환경변수 기반 설정으로 이동
- OAuth `state` 검증 추가
- access/refresh token 및 사용자 프로필 디버그 출력 제거
- tracked `build/` 및 백업 ZIP 제거
- `.env`/secret 파일 ignore 정책 추가
- 사용하던 Naver 애플리케이션 폐기

**Evidence:** [Security hardening PR #49](https://github.com/fullstackteampj/MillkyWay/pull/49)

과거 Git 이력은 팀 협업 및 기여 기록을 보존하기 위해 유지하고, 현재 연결 구조에는 실제 credential을 넣지 않습니다.

## Why this project is in my portfolio

MilkyWay의 가치는 최신 프레임워크를 사용했다는 데 있지 않습니다. 이 프로젝트는 다음 경험을 증명합니다.

- 팀 단위 Git 브랜치/PR 협업
- JSP/Servlet/JDBC를 통한 웹 요청–DB 연결 이해
- 인증·회원·주문·취소처럼 서로 연결된 상태 처리
- 외부 API와 내부 DB를 함께 사용하는 서비스 구현
- 실제 PR 기록을 근거로 개인 기여 범위를 구분하는 태도
- 과거 구현을 현재 기준으로 다시 평가하고 보안 문제를 정리하는 유지보수 능력

---

이 저장소는 **개인 기여 Case Study**이며 MilkyWay 전체 프로젝트의 단독 제작을 주장하지 않습니다.
