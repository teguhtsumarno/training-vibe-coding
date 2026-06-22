# Migration of Employee Leave App from Local Storage to NeonDB (PostgreSQL) using Prisma ORM

Dokumen ini menjelaskan rencana migrasi penyimpanan aplikasi Employee Leave Management System dari penyimpanan berbasis Local Storage di browser ke basis data PostgreSQL di NeonDB menggunakan Prisma ORM.

---

## User Review Required

> [!IMPORTANT]
> - **Koneksi Database**: Menggunakan connection string NeonDB yang akan disimpan di dalam file `.env` di direktori proyek `employee-leave-app`.
> - **Pendekatan API Route**: Karena Next.js menggunakan Client Components untuk formulir dan visualisasi data, kami akan membuat API Route Handler (`/api/...`) di server Next.js agar Client Components dapat mengakses data database dengan aman tanpa memaparkan kredensial database langsung ke browser.
> - **Asynchronous Services**: Layanan (`auth-storage.ts`, `employee-storage.ts`, `leave-storage.ts`) akan dimodifikasi dari synchronous (membaca `localStorage` lokal) menjadi asynchronous (melakukan `fetch` ke API Route Handler).
> - **Sesi Login**: Sesi autentikasi dasar (`auth_session`) tetap disimpan di `localStorage` pada browser untuk pemeriksaan sinkron pada routing guard, tetapi pencocokan kredensial (username/password) akan memvalidasi ke database.

---

## Proposed Changes

Rencana migrasi dibagi menjadi **4 Fase**:

---

### Phase 1 — Database & Prisma Setup

#### [NEW] [employee-leave-app/.env](file:///D:/BNI/Training/bnu-demo/employee-leave-app/.env)
Menyimpan variabel lingkungan untuk koneksi ke NeonDB:
```env
DATABASE_URL="postgresql://neondb_owner:npg_OdsgWIJTH0P5@ep-divine-forest-aof2oehu-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

#### [NEW] [prisma/schema.prisma](file:///D:/BNI/Training/bnu-demo/employee-leave-app/prisma/schema.prisma)
Mendefinisikan skema tabel untuk database PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Employee {
  id         String   @id @default(uuid())
  name       String
  department String
  position   String
  username   String?  @unique
  password   String?
  role       String   // "user" | "approval1" | "approval2" | "admin"
  
  // Relations
  leaveRequests    LeaveRequest[] @relation("EmployeeLeaves")
  approvalRequests LeaveRequest[] @relation("ApproverLeaves")
}

model LeaveRequest {
  id          String   @id @default(uuid())
  employeeId  String
  approval1Id String
  startDate   String
  endDate     String
  reason      String
  status      String   // "PENDING_APPROVAL1" | "PENDING_APPROVAL2" | "APPROVED" | "REJECTED"

  // Relations
  employee    Employee @relation("EmployeeLeaves", fields: [employeeId], references: [id], onDelete: Cascade)
  approval1   Employee @relation("ApproverLeaves", fields: [approval1Id], references: [id], onDelete: Cascade)
}
```

#### [NEW] [prisma/seed.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/prisma/seed.ts)
Script untuk inisialisasi awal (seeding) admin default ke database jika belum ada:
```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  if (!password) return password;
  return typeof btoa === "function" ? btoa(password).split("").reverse().join("") : Buffer.from(password).toString("base64").split("").reverse().join("");
}

async function main() {
  const adminUsername = "admin";
  const existingAdmin = await prisma.employee.findUnique({
    where: { username: adminUsername },
  });

  if (!existingAdmin) {
    await prisma.employee.create({
      data: {
        name: "System Admin",
        department: "Management",
        position: "Administrator",
        username: adminUsername,
        password: hashPassword("admin123"),
        role: "admin",
      },
    });
    console.log("Admin seeded successfully!");
  } else {
    console.log("Admin already exists.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### [NEW] [src/lib/prisma.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/lib/prisma.ts)
Helper untuk mencegah inisialisasi ganda PrismaClient di mode development:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

---

### Phase 2 — API Routes Handlers (Backend)

#### [NEW] [src/app/api/auth/login/route.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/api/auth/login/route.ts)
Endpoint POST untuk memvalidasi kredensial login (username & password) terhadap database NeonDB.

#### [NEW] [src/app/api/employees/route.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/api/employees/route.ts)
Endpoint untuk:
- `GET`: Mengambil semua data karyawan dari database.
- `POST`: Menyimpan karyawan baru (hash password sebelum simpan).

#### [NEW] [src/app/api/employees/[id]/route.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/api/employees/[id]/route.ts)
Endpoint untuk:
- `GET`: Mengambil data satu karyawan berdasarkan ID.
- `PUT`: Mengubah data karyawan berdasarkan ID (hash password jika password diperbarui).
- `DELETE`: Menghapus data karyawan dan otomatis menghapus seluruh pengajuan cutinya.

#### [NEW] [src/app/api/leave-requests/route.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/api/leave-requests/route.ts)
Endpoint untuk:
- `GET`: Mengambil semua data pengajuan cuti.
- `POST`: Menyimpan pengajuan cuti baru.

#### [NEW] [src/app/api/leave-requests/[id]/route.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/api/leave-requests/[id]/route.ts)
Endpoint untuk:
- `PUT`: Mengubah status cuti (Persetujuan L1/L2 atau Penolakan).

---

### Phase 3 — Refactoring Services (Async Client Integration)

#### [MODIFY] [src/services/employee-storage.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/services/employee-storage.ts)
Ubah semua fungsi menjadi asynchronous dengan memanggil API endpoint `/api/employees`.

#### [MODIFY] [src/services/leave-storage.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/services/leave-storage.ts)
Ubah semua fungsi menjadi asynchronous dengan memanggil API endpoint `/api/leave-requests`.

#### [MODIFY] [src/services/auth-storage.ts](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/services/auth-storage.ts)
Ubah fungsi `login` menjadi async dengan melakukan POST ke `/api/auth/login`.

---

### Phase 4 — UI Components Adaptations

#### [MODIFY] [src/app/employees/page.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/employees/page.tsx)
Gunakan `await` untuk `getAllEmployees()` dan `deleteEmployee()` di dalam event handlers.

#### [MODIFY] [src/app/employees/new/page.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/employees/new/page.tsx)
Gunakan `await` untuk `createEmployee()`.

#### [MODIFY] [src/app/employees/edit/[id]/page.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/employees/edit/[id]/page.tsx)
Gunakan `await` untuk memuat data karyawan (`getEmployeeById`) di `useEffect` dan memperbaharui data (`updateEmployee`).

#### [MODIFY] [src/app/leave/page.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/leave/page.tsx)
Ambil data pengajuan cuti dan karyawan sekaligus secara async di `useEffect`, lalu kirimkan daftar karyawan ke `LeaveRequestTable` sebagai properti.

#### [MODIFY] [src/components/leave/LeaveRequestTable.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/components/leave/LeaveRequestTable.tsx)
Hapus pemanggilan direktif `getEmployeeById` di baris rendering. Ganti dengan pencarian nama dari properti `employees` yang diparsing dari atas.

#### [MODIFY] [src/components/leave/LeaveRequestForm.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/components/leave/LeaveRequestForm.tsx)
Ambil daftar karyawan secara async di `useEffect`.

#### [MODIFY] [src/components/dashboard/DashboardGrid.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/components/dashboard/DashboardGrid.tsx)
Ambil semua pengajuan cuti dan karyawan secara async di `useEffect` untuk kalkulasi widget statistik.

#### [MODIFY] [src/app/login/page.tsx](file:///D:/BNI/Training/bnu-demo/employee-leave-app/src/app/login/page.tsx)
Gunakan `await` untuk memvalidasi `login()` di event submit.

---

## Verification Plan

### Automated Verification
```bash
# Uji tipe TypeScript dan build aplikasi Next.js
npm run build
```

### Manual Verification
1. Jalankan inisialisasi basis data:
   ```bash
   npm install @prisma/client
   npm install -D prisma tsx
   npx prisma db push
   npx prisma db seed
   ```
2. Jalankan aplikasi lokal:
   ```bash
   npm run dev
   ```
3. Lakukan pengujian skenario:
   - Login menggunakan akun `admin` / `admin123`.
   - Tambah data karyawan baru dan edit.
   - Ajukan cuti baru, lalu setujui menggunakan peran approval terkait.
   - Verifikasi data masuk ke dashboard dan database NeonDB.
