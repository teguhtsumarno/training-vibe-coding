# Comprehensive Code Review Checklist

## Purpose

Dokumen ini digunakan sebagai panduan code review untuk source code yang dibuat secara manual maupun menggunakan AI Coding Assistant seperti Amazon Q, GitHub Copilot, Cursor, Claude Code, atau Gemini CLI.

Tujuan utama code review:

- Meningkatkan kualitas source code
- Mengurangi defect
- Mengurangi technical debt
- Meningkatkan maintainability
- Mengidentifikasi security vulnerability
- Memastikan kesesuaian terhadap standar coding

---

# 1. Functional Correctness

## Tujuan

Memastikan fitur berjalan sesuai requirement dan business rule.

### Yang Direview

#### Requirement Coverage

- Apakah seluruh requirement telah diimplementasikan?
- Apakah seluruh use case sudah tercakup?
- Apakah ada requirement yang terlewat?

#### Business Rule

- Apakah seluruh business rule diterapkan dengan benar?
- Apakah perhitungan sesuai spesifikasi?
- Apakah workflow sesuai proses bisnis?

#### Edge Cases

- Null value
- Empty value
- Boundary value
- Invalid input
- Concurrent update

#### Data Integrity

- Apakah data tetap konsisten?
- Apakah relasi data tetap valid?
- Apakah delete/update tidak menyebabkan orphan data?

### Temuan Umum

- Logic error
- Missing validation
- Incorrect calculation
- Workflow tidak lengkap

---

# 2. Security Review (OWASP)

## Tujuan

Mengidentifikasi vulnerability dan risiko keamanan.

### Authentication

Review:

- Hardcoded credential
- Hardcoded token
- Hardcoded API key
- Session validation
- Password storage
- Authentication bypass

### Authorization

Review:

- Missing role validation
- Missing ownership validation
- Broken access control
- Privilege escalation

### Input Validation

Review:

- Required field validation
- Input sanitization
- File upload validation
- API request validation

### OWASP Top Risks

#### Broken Access Control

- User dapat mengakses data user lain
- User dapat mengakses fungsi admin

#### Cryptographic Failure

- Password tidak di-hash
- Sensitive data tersimpan plaintext

#### Injection

- SQL Injection
- Command Injection
- LDAP Injection

#### Insecure Design

- Tidak ada rate limiting
- Tidak ada validation

#### Security Misconfiguration

- Debug mode aktif di production
- Directory listing terbuka

#### Vulnerable Components

- Dependency memiliki vulnerability

#### Identification and Authentication Failure

- Session management buruk
- Password policy lemah

#### Software and Data Integrity Failure

- Tidak ada integrity verification

#### Logging and Monitoring Failure

- Security event tidak tercatat

#### SSRF

- URL input tidak tervalidasi

---

# 3. Performance Review

## Tujuan

Memastikan aplikasi tetap cepat dan efisien.

### Rendering Performance

Review:

- Unnecessary re-render
- Missing memoization
- Large component
- Expensive computation saat render

### Algorithm Efficiency

Review:

- Nested loop
- O(n²) operation
- Duplicate processing

### Data Access

Review:

- Duplicate query
- N+1 query
- Repeated localStorage access

### Network

Review:

- Duplicate API call
- Large payload
- Missing caching

### Memory

Review:

- Memory leak
- Event listener tidak dibersihkan
- Subscription tidak di-unsubscribe

---

# 4. Architecture Review

## Tujuan

Memastikan struktur aplikasi sehat dan scalable.

### Separation of Concerns

Review:

- UI terpisah dari business logic
- Business logic terpisah dari data access

### Layering

Contoh:

```text
Page
↓
Component
↓
Service
↓
Repository
↓
Storage
```

### Coupling

Review:

- Apakah module terlalu saling bergantung?

### Cohesion

Review:

- Apakah satu module hanya memiliki satu tanggung jawab?

### Scalability

Review:

- Mudah menambah fitur?
- Mudah melakukan perubahan?

---

# 5. Maintainability Review

## Tujuan

Memastikan kode mudah dipahami dan dipelihara.

### Naming

Review:

- Variable jelas
- Function jelas
- Component jelas

### Readability

Review:

- Kode mudah dibaca
- Tidak terlalu kompleks

### Function Design

Review:

- Function terlalu panjang
- Terlalu banyak responsibility

### Duplication

Review:

- Duplicate logic
- Duplicate validation
- Duplicate component

### Code Smell

Review:

- Magic number
- Hardcoded value
- Dead code

---

# 6. Type Safety Review

## Tujuan

Mengurangi runtime error melalui type checking.

### Review

#### Hindari

```typescript
any;
```

#### Gunakan

```typescript
type Employee
interface Employee
```

### Null Safety

Review:

- Optional chaining
- Null handling
- Undefined handling

### Type Consistency

Review:

- Type antar module konsisten

---

# 7. Error Handling Review

## Tujuan

Memastikan sistem gagal dengan aman.

### Error Handling

Review:

- Try/Catch digunakan
- Error tidak ditelan

### User Feedback

Review:

- Error message jelas
- User tahu apa yang harus dilakukan

### Recovery

Review:

- Retry mechanism
- Fallback mechanism

### Logging

Review:

- Error dicatat

---

# 8. Validation Review

## Tujuan

Memastikan data valid sebelum diproses.

### Input Validation

Review:

- Required validation
- Length validation
- Format validation
- Range validation

### Business Validation

Contoh:

- End Date > Start Date
- Maximum Leave Days

### Cross Field Validation

Contoh:

- Password = Confirm Password

---

# 9. UI/UX Review

## Tujuan

Memastikan aplikasi mudah digunakan.

### Consistency

Review:

- Layout konsisten
- Warna konsisten
- Komponen konsisten

### Feedback

Review:

- Loading indicator
- Success notification
- Error notification

### Navigation

Review:

- Mudah dipahami
- Tidak membingungkan

### Responsiveness

Review:

- Desktop
- Tablet
- Mobile

---

# 10. Accessibility Review (A11Y)

## Tujuan

Memastikan aplikasi dapat digunakan semua pengguna.

### Semantic HTML

Gunakan:

```html
<button></button>
```

Bukan:

```html
<div onclick=""></div>
```

### Keyboard Accessibility

Review:

- Tab navigation
- Keyboard shortcut

### Label

Review:

- Semua input memiliki label

### Contrast

Review:

- Teks mudah dibaca

### Screen Reader

Review:

- Aria label tersedia

---

# 11. Dependency Review

## Tujuan

Mengurangi risiko supply chain dan dependency issue.

### Dependency Relevance

Review:

- Benar-benar dibutuhkan?

### Security

Review:

- Vulnerability scan
- npm audit
- Snyk scan

### Version Management

Review:

- Dependency terbaru?
- Dependency masih aktif?

### Size Impact

Review:

- Terlalu besar?
- Menambah bundle size berlebihan?

---

# 12. Logging & Observability

## Tujuan

Mempermudah troubleshooting dan monitoring.

### Logging

Review:

- Error log
- Audit log
- Business event log

### Monitoring

Review:

- Error tracking
- Health monitoring

### Sensitive Data

Jangan log:

```text
Password
Token
API Key
Credential
```

### Audit Trail

Contoh:

```text
User A approved Leave Request #123
```

---

# 13. AI Generated Code Review

## Tujuan

Mengidentifikasi risiko khusus pada kode hasil AI.

### Over Engineering

Review:

- Terlalu banyak abstraction
- Design pattern tidak perlu

### Hallucination

Review:

- Library tidak ada
- Function tidak ada
- API tidak ada

### Dead Code

Review:

- Unused component
- Unused helper
- Unused function

### Duplicate Logic

Review:

- Logic sama di banyak tempat

### Fake Security

Review:

- Security terlihat ada tetapi sebenarnya tidak efektif

### Maintainability Risk

Review:

- Struktur terlalu kompleks
- Sulit dipahami developer lain

---

# Severity Classification

## Critical

Dampak:

- Data breach
- Authentication bypass
- Data corruption

Action:

```text
Release Blocker
```

---

## High

Dampak:

- Functional bug besar
- Workflow gagal
- Major performance issue

Action:

```text
Fix Before Production
```

---

## Medium

Dampak:

- Maintainability issue
- Minor performance issue
- Readability issue

Action:

```text
Fix During Sprint
```

---

## Low

Dampak:

- Naming issue
- Style issue
- Refactoring opportunity

Action:

```text
Backlog
```

---

# Review Report Template

| Area                     | Status    | Severity                 | Finding | Recommendation |
| ------------------------ | --------- | ------------------------ | ------- | -------------- |
| Functional Correctness   | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Security                 | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Performance              | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Architecture             | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Maintainability          | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Type Safety              | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Error Handling           | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Validation               | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| UI/UX                    | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Accessibility            | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Dependency Review        | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| Logging & Observability  | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |
| AI Generated Code Review | PASS/FAIL | Critical/High/Medium/Low | Temuan  | Rekomendasi    |

---

# Final Recommendation

Pilih salah satu:

- APPROVED
- APPROVED WITH MINOR CHANGES
- REQUEST CHANGES
- REJECTED

## Reviewer Information

| Field       | Value |
| ----------- | ----- |
| Reviewer    |       |
| Review Date |       |
| Application |       |
| Version     |       |
| Repository  |       |

## Summary

### Total Findings

| Severity | Count |
| -------- | ----- |
| Critical |       |
| High     |       |
| Medium   |       |
| Low      |       |

### Conclusion

Tuliskan ringkasan hasil review dan keputusan akhir.
