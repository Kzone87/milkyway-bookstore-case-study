# MilkyWay Legacy Modernization Plan

이 문서는 2024년 Java/JSP/Servlet/MySQL 팀 프로젝트를 현재 운영 서비스라고 가정했을 때, **전면 재개발부터 시작하지 않고 위험을 낮추면서 현대화하는 방법**을 정리한 포트폴리오용 기술 계획입니다.

원본 팀 프로젝트의 코드를 이 저장소로 복제하지 않으며, 공개 Git 기록에서 확인되는 구조와 개인 기여 경험을 바탕으로 현대화 전략만 문서화합니다.

## 1. Modernization goals

현대화의 목적은 “최신 프레임워크로 바꾸기” 자체가 아닙니다.

우선순위는 다음과 같습니다.

1. credential과 인증 흐름의 위험 제거
2. 핵심 사용자 흐름을 테스트로 고정
3. DB transaction 경계 명확화
4. JSP/Servlet/JDBC에 섞인 책임 분리
5. 변경이 잦은 기능부터 Spring Boot 기반 경계로 이동
6. 관측 가능성과 배포 재현성 확보
7. 기능 중단 없이 점진적으로 기존 경로를 대체

## 2. Legacy characteristics

기존 프로젝트에서 확인되는 전형적인 legacy 특성은 다음과 같습니다.

- JSP와 Servlet이 화면·요청 처리 책임을 함께 가짐
- JDBC/Manager 중심 데이터 접근
- 여러 SQL이 하나의 업무 상태 전이를 구성하는 기능 존재
- 세션 기반 로그인과 외부 OAuth 흐름
- 문자열 중심 상태값과 요청 파라미터
- 과거 개발용 credential이 소스와 Git 이력에 포함된 경험
- 자동화 테스트와 CI가 프로젝트 핵심 개발 당시 충분하지 않음

이 조건에서는 “모든 코드를 새 프로젝트로 옮긴 뒤 한 번에 교체”하는 방식이 가장 위험합니다.

## 3. Target architecture

```text
Browser
   │
   ├─ Existing JSP pages (temporary)
   │
   └─ New UI / API consumers
           │
           ▼
      Spring Boot API
           │
      ┌────┴─────────────┐
      │                  │
  Application        Security
   Services          / OAuth
      │
      ▼
 Repository / Mapper
      │
      ▼
    MySQL
```

초기에는 기존 JSP를 즉시 제거하지 않습니다. 새로운 API와 서비스 계층을 먼저 만들고 기존 화면이 필요하면 해당 계층을 사용하도록 연결합니다.

## 4. Phase 0 — Inventory and safety baseline

코드 변경 전에 다음을 확인합니다.

### Inventory

- 로그인 / 회원가입 / 비밀번호 변경
- 도서 검색
- 장바구니 / 위시리스트
- 주문 / 주문취소
- 마이페이지
- 관리자 기능
- Naver API / OAuth
- DB table과 주요 FK 관계
- session attribute 사용 위치
- 외부 credential 사용 위치

### Immediate safety work

- 활성 credential 회전 또는 폐기
- `.env`, secret manager 등 환경별 설정 분리
- access token / refresh token / 개인정보 debug logging 제거
- OAuth `state` 검증
- build 산출물과 backup ZIP repository tracking 제거

이 단계의 목적은 리팩터링 전에 **현재 노출 위험부터 줄이는 것**입니다.

## 5. Phase 1 — Characterization tests

legacy 코드를 수정하기 전에 현재 동작을 테스트로 고정합니다.

가장 먼저 고정할 흐름:

```text
회원가입
  ↓
로그인
  ↓
도서 검색
  ↓
장바구니
  ↓
주문
  ↓
주문 취소
```

그리고 관리 흐름:

```text
관리자 로그인
  ↓
회원 / 주문 조회
  ↓
상태 처리
```

### Test layers

- HTTP integration test
- DB integration test
- 주요 SQL 결과 검증
- 인증/권한 회귀 테스트
- 외부 API adapter mock

목표는 기존 코드를 “좋은 코드”로 만드는 것이 아니라 **안전하게 바꿀 수 있는 기준선을 만드는 것**입니다.

## 6. Phase 2 — Transaction boundaries

다음 기능은 여러 SQL이 하나의 업무 작업을 구성하므로 transaction으로 묶는 것이 우선입니다.

### Cart → Wishlist

```text
source 존재 확인
   ↓
target INSERT
   ↓
source DELETE
```

중간 실패 시 일부만 반영되면 안 됩니다.

### Order cancellation

```text
주문 확인
   ↓
취소 가능 상태 확인
   ↓
취소 데이터 생성
   ↓
원 주문 상태 변경
```

이 역시 하나의 transaction이어야 합니다.

Spring `@Transactional` 도입 전에도 transaction boundary를 서비스 책임으로 명확하게 정의하는 것이 먼저입니다.

## 7. Phase 3 — Extract application services

Servlet이 직접 DB 로직을 수행하는 부분을 다음 형태로 이동합니다.

```text
Servlet / Controller
       ↓
Application Service
       ↓
Repository / Mapper
       ↓
Database
```

예:

```text
OrderCancelServlet
       ↓
OrderService.cancel(orderId, userId)
       ↓
OrderRepository
```

Controller는 HTTP 해석에 집중하고 Service가 업무 규칙을 소유하게 합니다.

## 8. Phase 4 — Explicit state models

문자열 상태는 enum/state model로 바꿉니다.

예:

```text
ORDERED
   ↓
PAID
   ↓
PREPARING
   ↓
SHIPPED
   ↓
COMPLETED
```

취소는 허용되는 상태에서만 이동합니다.

```text
ORDERED ──────> CANCELLED
PAID ─────────> CANCEL_REQUESTED
PREPARING ────> CANCEL_REQUESTED
SHIPPED ──────> cancellation denied / return flow
```

상태 전이를 서비스에서 검증하면 화면에서 잘못된 요청을 보내도 DB 상태가 무작위로 변경되지 않습니다.

## 9. Phase 5 — Authentication modernization

과거 구현의 직접 SHA-256 + salt 방식은 신규 시스템에서 유지하지 않습니다.

새 인증 경계에서는:

- Spring Security
- Argon2id 또는 bcrypt 계열 password hashing
- session fixation protection
- CSRF 정책 명시
- OAuth2 Client
- OAuth `state`/nonce 검증
- logout/session invalidation
- admin route authorization

을 사용합니다.

기존 사용자 비밀번호를 즉시 모두 재설정하기보다 **로그인 성공 시 새 해시로 재해싱하는 migration strategy**도 고려할 수 있습니다.

## 10. Phase 6 — Spring Boot strangler migration

전체 기능을 한 번에 Spring Boot로 이동하지 않습니다.

변경 빈도와 위험도를 기준으로 기능을 하나씩 대체합니다.

추천 순서:

1. 읽기 중심 도서 검색 API
2. 회원 프로필 조회
3. 장바구니 / 위시리스트
4. 주문 조회
5. 주문/취소 write workflow
6. 관리자 기능
7. 인증 경계

각 기능은 다음 조건을 만족한 뒤 기존 경로를 제거합니다.

```text
새 API 구현
   ↓
Integration test
   ↓
기존 결과와 비교
   ↓
일부 요청 전환
   ↓
관찰
   ↓
전체 전환
   ↓
legacy route 제거
```

## 11. Database migration strategy

초기에는 DB를 동시에 바꾸지 않는 것이 안전합니다.

Spring Boot 서비스가 기존 MySQL schema를 사용하되:

- Flyway 또는 Liquibase로 migration 이력 도입
- FK / index 확인
- nullable / status column 규칙 정리
- monetary column type 확인
- transaction isolation 요구 확인

을 단계적으로 수행합니다.

프레임워크와 DB schema를 같은 release에서 대규모 변경하지 않습니다.

## 12. Observability

운영 서비스로 가정하면 최소한 다음을 추가합니다.

- request correlation ID
- structured application log
- 인증 실패 / 권한 실패 로그
- 외부 API timeout / failure metric
- DB exception tracking
- health endpoint
- deploy version 확인

단, access token, password, 개인정보를 application log에 기록하지 않습니다.

## 13. Deployment baseline

```text
Build
  ↓
Automated tests
  ↓
Artifact / container
  ↓
Environment-specific config
  ↓
Deploy
  ↓
Health check
```

필수 조건:

- source에 credential 없음
- production config 분리
- DB migration version 관리
- rollback 가능한 artifact
- CI에서 최소 integration test 실행

## 14. Risk matrix

| Risk | Impact | Priority | Mitigation |
| --- | --- | --- | --- |
| 노출된 credential | Critical | P0 | rotate/revoke + secret 분리 |
| 주문/취소 partial update | High | P0 | transaction boundary |
| 인증 로직 직접 구현 | High | P1 | Spring Security migration |
| 자동화 테스트 부족 | High | P1 | characterization tests |
| 문자열 상태값 | Medium/High | P1 | enum + state transition service |
| Controller/JDBC 혼재 | Medium | P2 | service/repository extraction |
| 대규모 일괄 rewrite | High | Avoid | strangler/incremental migration |

## 15. Definition of done for each migrated feature

한 기능을 “현대화 완료”로 보려면 최소한 다음 조건을 만족해야 합니다.

- 요청/응답 계약 명시
- validation 정의
- 권한 조건 정의
- transaction boundary 정의
- 정상/실패 integration test
- credential hardcoding 없음
- 로그에 민감정보 없음
- rollback 또는 기존 경로 복귀 방법 확인
- README/API 문서 갱신

## Portfolio value

이 문서의 목적은 “Spring Boot를 사용할 줄 안다”는 것을 보여주는 데 있지 않습니다.

외주 유지보수에서 중요한 다음 판단을 증명하는 것이 목적입니다.

- 기존 시스템을 무조건 버리지 않음
- 보안 위험과 데이터 무결성을 먼저 처리
- 테스트로 현재 동작을 고정한 뒤 변경
- transaction과 상태 전이를 업무 규칙으로 다룸
- 대규모 rewrite 대신 단계적으로 migration
- 배포와 rollback까지 변경 범위에 포함
