# 📋 Employee Leave Management System

Aplikasi manajemen cuti karyawan berbasis web dengan sistem persetujuan berjenjang (multi-level approval), notifikasi email otomatis, dan manajemen saldo cuti per karyawan.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript |
| **UI Components** | Base UI + Shadcn-style custom components |
| **Styling** | Tailwind CSS v4 |
| **Database** | PostgreSQL (Neon) |
| **ORM** | Prisma |
| **Email** | Nodemailer (SMTP) |
| **Font** | Inter (Google Fonts) |

---

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (atau Neon serverless)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Setup environment variables
cp .env.example .env
# Edit .env dengan DATABASE_URL Anda

# 3. Push schema ke database
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 👥 Sistem Role & Hak Akses

Aplikasi memiliki **4 role** dengan hak akses berbeda:

### 1. 🔑 Admin
- Melihat **semua** data leave request
- Mengelola data **Employees** (CRUD)
- Mengelola **Leave Types** (jenis cuti)
- Mengelola **saldo cuti** per karyawan
- Mengatur **SMTP Settings** untuk notifikasi email
- Approve/Reject leave request di semua level
- Akses **Calendar** jadwal cuti
- Melihat semua statistik di Dashboard

### 2. ✅ Approval Level 1
- Melihat leave request yang **ditujukan kepadanya**
- **Approve** → status berubah ke `PENDING_APPROVAL2`
- **Reject** → status berubah ke `REJECTED`
- Bisa memberikan **message/catatan** saat approve/reject
- Akses **Calendar** jadwal cuti
- **Tidak bisa** edit/delete leave request

### 3. ✅ Approval Level 2
- Melihat leave request yang sudah **di-approve L1**
- **Approve** → status berubah ke `APPROVED` (final)
- **Reject** → status berubah ke `REJECTED`
- Bisa memberikan **message/catatan** saat approve/reject
- Akses **Calendar** jadwal cuti
- **Tidak bisa** edit/delete leave request

### 4. 👤 User (Employee)
- Mengajukan **leave request** baru
- Memilih **approver L1** saat mengajukan cuti
- Melihat & mengedit **request milik sendiri**
- Melihat **sisa saldo cuti** per jenis cuti di Dashboard
- Melihat **Approval History** tiap request

---

## 📱 Fitur-Fitur Aplikasi

### 🏠 Dashboard
- **Statistik ringkasan**: Pending, Approved, Rejected requests
- **Total Employees** (khusus admin)
- **Sisa Saldo Cuti** per jenis cuti (khusus role user)
- Data ditampilkan sesuai hak akses masing-masing role
- Approval hanya melihat request yang ditujukan kepadanya

### 👨‍💼 Employee Management (Admin Only)
- **Tambah karyawan** baru dengan role (user/approval1/approval2/admin)
- **Edit** data karyawan (nama, department, position, role, email, username, password)
- **Hapus** karyawan beserta semua leave request terkait
- **Search** karyawan berdasarkan nama
- **Manage Leave Balance** — ikon Wallet (💰) untuk mengatur saldo cuti per karyawan (khusus role user)

### 📅 Leave Types / Jenis Cuti (Admin Only)
- **Tambah jenis cuti** baru (contoh: Cuti Tahunan, Cuti Sakit, dll)
- Set **default balance** (jumlah hari default)
- **Edit & Delete** jenis cuti
- Saat jenis cuti dibuat → otomatis assign saldo ke semua employee ber-role `user`

### 💰 Leave Balance Management (Admin Only)
- Akses dari tombol **Wallet** di tabel Employee (hanya untuk role user)
- Menampilkan **info karyawan** (nama, department, position, role)
- Tabel semua jenis cuti dengan **input balance** yang bisa diedit
- **Save per-row** dengan loading indicator
- **Reset** perubahan yang belum disimpan

### 📝 Leave Request (Pengajuan Cuti)
- **Buat pengajuan cuti** dengan memilih:
  - Jenis cuti (dari master data leave types)
  - Tanggal mulai & selesai
  - Approver Level 1
  - Alasan cuti
- **Validasi otomatis**:
  - Cek saldo cuti mencukupi
  - Tanggal selesai harus setelah tanggal mulai
- **Saldo langsung dikurangi** saat pengajuan dibuat
- **Edit** request yang masih berstatus `PENDING_APPROVAL1` (hanya user & admin)
- **Delete** request (saldo otomatis dikembalikan)

### ✅ Approval Workflow (Alur Persetujuan)
Sistem menggunakan **2-level approval**:

```
User Submit → PENDING_APPROVAL1 → Approval L1 Approve → PENDING_APPROVAL2 → Approval L2 Approve → APPROVED
                                → Approval L1 Reject  → REJECTED
                                                       → Approval L2 Reject  → REJECTED
```

- Approver bisa menambahkan **message/catatan** saat approve atau reject
- Tombol approve/reject hanya muncul untuk approver yang berwenang
- Tombol edit/delete **tersembunyi** untuk role approval1 & approval2
- **Loading indicator** saat proses approve/reject berlangsung

### 📜 Approval History
- Tampil sebagai **popup dialog** (bukan halaman baru)
- Timeline dengan **color-coded dots**:
  - 🟢 Created — Formulir diajukan
  - 🟡 Updated — Formulir diperbarui
  - 🔵 Approved L1 — Persetujuan Level 1
  - 🟢 Approved — Disetujui penuh
  - 🔴 Rejected — Ditolak
- Menampilkan **nama aktor**, **waktu**, dan **message/catatan** approver

### 📧 Email Notifications
- **Saat pengajuan dibuat** → email ke Approver L1
- **Saat L1 approve** → email ke semua user Approval L2
- **Saat L2 approve (final)** → email ke karyawan yang mengajukan
- **Saat ditolak** → email ke karyawan yang mengajukan
- Konfigurasi SMTP melalui menu **SMTP Settings** (admin only)

### 📆 Calendar (Admin, Approval1, Approval2)
- Tampilan kalender jadwal cuti semua karyawan
- Memudahkan monitoring jadwal cuti tim

### 👤 User Profile
- Dropdown di kanan atas navigasi
- Menampilkan **nama**, **role**, dan **avatar inisial**
- Tombol **Logout**

---

## 🗄️ Database Schema

```
Employee
├── id, name, department, position
├── username, password, email, role
├── leaveRequests[] (EmployeeLeaves)
├── approvalRequests[] (ApproverLeaves)
└── leaveBalances[] (EmployeeLeaveBalance)

LeaveType
├── id, name, defaultBalance, description
├── leaveRequests[]
└── employeeBalances[]

EmployeeLeaveBalance
├── id, employeeId, leaveTypeId, balance
└── @@unique([employeeId, leaveTypeId])

LeaveRequest
├── id, employeeId, approval1Id, leaveTypeId
├── startDate, endDate, reason, status
└── history[] (ApprovalHistory)

ApprovalHistory
├── id, leaveRequestId, action
├── actorId, actorName, message
└── createdAt

SmtpSettings
├── host, port, secure, user, password
├── fromName, fromEmail, enabled
└── id (singleton)
```

---

## 🔒 Aturan Bisnis Saldo Cuti

| Event | Efek pada Saldo |
|-------|----------------|
| User ajukan cuti (3 hari) | Saldo **-3** |
| Request di-reject | Saldo **+3** (dikembalikan) |
| Request di-delete | Saldo **+3** (dikembalikan) |
| Request di-edit (3→5 hari) | Saldo **-2** (selisih) |
| Request di-edit (5→3 hari) | Saldo **+2** (selisih) |

> **Catatan:** Hanya karyawan dengan role `user` yang memiliki saldo cuti. Role admin, approval1, dan approval2 **tidak memiliki** saldo cuti.

---

## 🎨 Design System

Aplikasi menggunakan design system Antigravity dengan:
- **Warna utama**: `#121317` (text), `#F8F9FC` (background), `#3279F9` (accent blue)
- **Border**: `#E1E6EC`
- **Border radius**: `16px` (cards), `9999px` (buttons/pills)
- **Font**: Inter (heading & body)
- **Animasi**: Smooth transitions, loading spinners, hover effects
- **Dialog popup**: Semi-transparent overlay dengan backdrop blur

---

## 📁 Struktur Folder

```
src/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/login/         # Authentication
│   │   ├── employees/          # Employee CRUD + leave balances
│   │   ├── leave-requests/     # Leave request CRUD + history
│   │   ├── leave-types/        # Leave type CRUD
│   │   └── smtp-settings/      # SMTP configuration
│   ├── dashboard/              # Dashboard page
│   ├── employees/              # Employee pages (list, new, edit, balances)
│   ├── leave/                  # Leave request pages (list, new, edit)
│   ├── leave-types/            # Leave types management
│   ├── login/                  # Login page
│   ├── calendar/               # Calendar view
│   └── smtp-settings/          # SMTP settings page
├── components/
│   ├── dashboard/              # Dashboard components
│   ├── employee/               # Employee components (form, table, search, delete dialog)
│   ├── leave/                  # Leave components (form, table, status badge, action dialog)
│   ├── shared/                 # Shared components (navbar, sidebar, page header, protected route)
│   └── ui/                     # Base UI components (button, input, table, dialog, etc.)
├── hooks/                      # Custom hooks (useAuth)
├── lib/                        # Utilities (prisma, email, utils)
├── services/                   # API client services
├── types/                      # TypeScript type definitions
└── constants/                  # App constants & routes
```

---

## 📄 License

Private — Internal use only.
