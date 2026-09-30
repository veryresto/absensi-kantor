# Dokumentasi Arsitektur Sistem

Aplikasi **VeryResto WFH Attendance & HR Monitoring** dirancang menggunakan arsitektur **Microservices** dengan REST API, WebSockets (Socket.IO) untuk notifikasi real-time, serta Message Queue (RabbitMQ) untuk pencatatan audit log ke database sekunder.

---

## 1. Diagram Arsitektur (Mermaid)

```mermaid
flowchart LR
    subgraph Clients ["Client Browsers"]
        EmployeeBrowser["Browser Karyawan"]
        AdminBrowser["Browser HRD"]
    end

    subgraph Proxy ["Reverse Proxy"]
        Caddy["Caddy<br/>HTTPS/WSS :443"]
    end

    subgraph Frontends ["Frontend Containers"]
        EmployeeWeb["employee-web<br/>React + Nginx :80"]
        AdminWeb["admin-web<br/>React + Nginx :80"]
    end

    subgraph BackendServices ["Backend Services (NestJS)"]
        API["REST API + Socket.IO Gateway<br/>NestJS :3000"]
        MQ_Sub["Audit Log Microservice Subscriber<br/>(RabbitMQ Consumer)"]
    end

    subgraph Broker ["Message Broker"]
        RMQ["RabbitMQ Broker<br/>(profile_updates_queue)"]
    end

    subgraph Storage ["Databases & Storage"]
        DB1[("Primary Database<br/>PostgreSQL:5432<br/>wfh_attendance_db")]
        DB2[("Secondary Database<br/>PostgreSQL:5433<br/>audit_log_db")]
        FS["Filesystem Photo Uploads<br/>(Local Storage)"]
    end

    %% Browser requests enter through Caddy
    EmployeeBrowser -->|"HTTPS"| Caddy
    AdminBrowser -->|"HTTPS / WSS"| Caddy

    %% Host-based routing
    Caddy -->|"absen.veryresto.com"| EmployeeWeb
    Caddy -->|"absen-admin.veryresto.com"| AdminWeb
    Caddy -->|"absen-api.veryresto.com<br/>REST, uploads, Socket.IO"| API

    %% Primary Data Flow
    API -->|Read/Write Data| DB1
    API -->|Save Photo Files| FS

    %% Profile Update Event Flow
    API -.->|"1. Socket.IO event"| Caddy
    Caddy -.->|"Koneksi WSS yang aktif"| AdminBrowser
    API -->|2. Publish Event 'profile.updated'| RMQ
    RMQ -->|Consume Message| MQ_Sub
    MQ_Sub -->|Persist Audit Log| DB2
```

Browser selalu mengakses sistem melalui **Caddy**. Caddy melakukan routing berdasarkan
hostname: dua domain aplikasi menuju container frontend masing-masing, sedangkan domain
API menuju proses NestJS. Setelah JavaScript frontend dimuat di browser, request REST,
upload, dan koneksi Socket.IO juga dikirim melalui Caddy menggunakan domain API; browser
tidak mengakses port internal container secara langsung.

---

## 2. Alur Perubahan Data Profil Karyawan (Flow Requirement 3.A.1 & 3.A.2)

Ketika Karyawan memperbarui data profilnya (Foto, Nomor HP, atau Password):
1. **Frontend App (`absen.veryresto.com`)** mengirim permintaan `PATCH /api/employees/me` dengan data baru dan opsional file foto.
2. **Backend API (`backend`)**:
   - Menyimpan file foto ke dalam sistem berkas lokal (`uploads/photos/`).
   - Memperbarui data pengguna pada **Primary Database (`wfh_attendance_db`)**.
   - **Requirement 3.A.1 (Popup Alert Realtime)**: Memancarkan event WebSocket (`employee_profile_updated`) ke **HRD Admin App (`absen-admin.veryresto.com`)**, yang langsung menampilkan notifikasi popup/toast di layar admin.
   - **Requirement 3.A.2 (Data Stream / Message Queue)**: Mempublikasikan event (`profile.updated`) ke antrean **RabbitMQ (`profile_updates_queue`)**.
3. **Audit Log Microservice Consumer**:
   - Menerima pesan dari antrean RabbitMQ secara asinkron.
   - Menyimpan payload log perubahan profil (sebelum & sesudah) ke **Secondary Database (`audit_log_db`)**.

---

## 3. Catatan Penyimpanan Objek / Storage (Notes Item #1)

Sesuai instruksi pengembangan, saat ini penyimpanan foto profil karyawan disimpan pada **Filesystem lokal** di direktori `./uploads/photos/`. 

```typescript
// TODO: Setup Object Storage (AWS S3 / GCP Cloud Storage / MinIO) untuk produksi
```
Dalam lingkungan produksi skala besar, layer penyimpanan lokal ini dapat diganti dengan AWS S3 atau Google Cloud Storage tanpa mengubah logika bisnis inti aplikasi.
