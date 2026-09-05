# MilkyWay · 은하수책방 — Contribution Case Study

> Java/JSP/MySQL 기반 온라인 서점 팀 프로젝트에서 제가 담당한 기능과 협업 이력을 정리한 개인 포트폴리오용 Case Study입니다.

## Project at a glance

- **Project:** MilkyWay · 은하수책방
- **Type:** Team project
- **Period:** 2024.09–2024.10
- **Original team repository:** `fullstackteampj/MillkyWay`
- **My GitHub account:** `Kzone87`
- **My working branch:** `junghoon`
- **Stack:** Java, JSP, Servlet, MySQL, JavaScript, Gson, Naver Open API, Tomcat

이 저장소는 팀 프로젝트 전체 소스를 제 개인 작업물처럼 복제하기 위한 저장소가 아닙니다. 원본 Git 이력에서 확인되는 **제 기여 범위, 구현 의도, 협업 경험과 개선 포인트**만 정리합니다.

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

GitHub의 원본 이력에는 `Kzone87` 계정에서 생성해 병합된 PR이 다수 남아 있습니다. 동기화용 PR을 제외하고, 포트폴리오에서는 아래처럼 실제 기능 구현이 확인되는 작업을 중심으로 설명합니다.

### 1. 도서 검색 흐름

- Naver Book Search API 호출을 Servlet 엔드포인트로 연결
- 검색 결과를 JSON으로 브라우저에 반환하는 흐름 구현
- 내부 도서 DB 검색용 Servlet 구현
- 제목/저자 및 카테고리 조건에 따라 MySQL 조회
- Gson을 이용해 검색 결과를 JSON으로 변환

초기 구현 단계에서 외부 검색 API와 내부 DB 검색을 별도 경로로 분리하면서 브라우저가 두 데이터 소스를 사용할 수 있도록 구성했습니다.

**Evidence:** original PR #1

### 2. 비밀번호 해시 + 사용자별 salt

- `SecureRandom`을 사용한 salt 생성 로직 작성
- 비밀번호와 salt를 결합해 SHA-256 해시 생성
- 회원 로그인 시 DB의 salt를 조회해 입력 비밀번호 검증
- 비밀번호 변경 시 **새 salt를 다시 생성**하고 해시와 함께 저장하도록 개선
- 평문 비밀번호 비교 흐름을 해시 검증 흐름으로 변경

단순 SHA-256 적용에서 끝내지 않고 사용자별 salt 저장과 비밀번호 변경 시 salt 재발급까지 연결했습니다.

**Evidence:** original PR #7, #9, #11

> 현재 기준으로 신규 인증 시스템을 설계한다면 직접 SHA-256을 조합하기보다 Argon2id, bcrypt 또는 scrypt 같은 password hashing KDF와 검증된 인증 라이브러리를 사용합니다. 이 항목은 당시 구현 경험과 이후 보안 관점의 발전을 함께 보여주기 위해 남깁니다.

### 3. 장바구니 / 위시리스트 상태 이동

- 장바구니 항목을 위시리스트로 이동
- 위시리스트 항목을 장바구니로 이동
- 기존 레코드를 조회하고 대상 테이블에 삽입한 뒤 원본을 제거하는 흐름 구현
- 장바구니 추가 및 관련 사용자 흐름 보완

**Evidence:** original PR #5 and related merged work

### 4. 마이페이지와 주문 취소

- 회원정보 조회/수정 범위 확장
- 사용자 상태와 상세주소 처리
- 비밀번호 확인 로직 연결
- 구매내역에서 주문 식별자와 수량 처리
- 취소 요청 정보를 별도 취소 데이터로 이동하는 흐름 구현
- 취소 목록에 가격·수량 정보 추가
- 회원 탈퇴 상태 처리 로직 구현

**Evidence:** original PR #23, #33

### 5. Naver 로그인 연동

- Naver 사용자 JSON 응답 파싱
- 기존 가입 여부 확인
- Naver 계정 식별자를 기준으로 내부 사용자 조회
- 신규 소셜 사용자 등록
- 소셜 로그인 사용자와 일반 로그인 사용자의 마이페이지 표시 분기

**Evidence:** original PR #23 and related merged work

### 6. 관리자 및 라우팅

- 관리자 로그인 흐름 보완
- `/admin/*` 요청을 JSP 화면으로 연결하는 Servlet 라우팅 추가
- 사용자 상태 및 마지막 로그인 일자 처리
- 관리자/마이페이지 기능 통합 과정에서 발생한 화면·데이터 연결 보완

**Evidence:** original PR #33

### 7. Tomcat 10 / Jakarta Servlet 전환

프로젝트 후반에는 Servlet import를 `javax.servlet.*`에서 `jakarta.servlet.*`로 변경해 Tomcat 10 계열 환경에 맞추는 작업에도 참여했습니다.

**Evidence:** original PR #43

## Collaboration evidence

원본 GitHub 기록상 `Kzone87` 계정으로 생성된 병합 PR이 **20개** 확인됩니다. 이 중 일부는 `main ↔ junghoon` 브랜치 동기화용 PR이고, 위의 Contribution 항목은 실제 diff에서 기능 구현이 확인되는 PR만 선별한 것입니다.

이 프로젝트에서 경험한 협업 방식은 다음과 같습니다.

- 기능별 개인 브랜치 사용
- 작업 내용을 `main`으로 PR 병합
- 팀원 변경사항을 개인 브랜치로 다시 동기화
- 충돌 해결 후 기능 통합
- DB 스키마와 JSP/Java 코드가 함께 변경되는 기능 단위 작업

## What I would improve today

이 프로젝트는 당시 학습·팀 개발 환경의 제약이 그대로 남아 있습니다. 지금 다시 설계한다면 다음을 우선 개선합니다.

1. **Controller / Service / Repository 계층 분리**  
   JSP와 JDBC 중심 로직을 Spring Boot 기반 계층형 구조로 분리합니다.

2. **트랜잭션 적용**  
   장바구니→위시리스트, 구매→취소처럼 여러 SQL이 하나의 상태 전이를 구성하는 작업은 단일 DB transaction으로 묶습니다.

3. **인증 현대화**  
   비밀번호는 Argon2id/bcrypt 계열을 사용하고 세션·OAuth 처리를 검증된 보안 프레임워크에 위임합니다.

4. **Secret 관리**  
   API credential과 DB credential을 소스에서 완전히 제거하고 환경변수 또는 secret manager로 관리합니다.

5. **SQL/DTO 타입 안정성**  
   문자열 기반 상태값을 명시적 enum/state model로 관리하고 validation을 추가합니다.

6. **자동화된 테스트와 CI**  
   로그인, 주문, 취소, 검색 등 핵심 흐름을 integration test로 검증하고 PR마다 CI를 수행합니다.

## Security note about the legacy repository

원본 팀 저장소에는 과거 학습 프로젝트 특성상 **하드코딩된 외부 API credential과 로컬 DB credential이 Git 이력 및 현재 소스에 남아 있는 부분**이 확인됩니다.

이 Case Study에는 해당 값을 복사하거나 노출하지 않습니다. 원본 credential은 이미 노출된 것으로 간주하고 사용 중이라면 **폐기/재발급**해야 합니다. 이 때문에 현재 개인 포트폴리오에서는 원본 저장소를 직접 홍보 링크로 사용하지 않습니다.

## Why this project is in my portfolio

MilkyWay의 가치는 최신 프레임워크를 사용했다는 데 있지 않습니다. 제 포트폴리오에서는 다음 경험을 보여주는 프로젝트입니다.

- 팀 단위 Git 브랜치/PR 협업
- JSP/Servlet/JDBC를 통한 웹 요청–DB 연결 이해
- 인증·회원·주문·취소처럼 서로 연결된 상태 처리
- 외부 API와 내부 DB를 함께 사용하는 서비스 구현
- 과거 구현을 현재 기준으로 다시 평가하고 개선점을 설명하는 능력

---

이 저장소는 **개인 기여 Case Study**이며 MilkyWay 전체 프로젝트의 단독 제작을 주장하지 않습니다.
