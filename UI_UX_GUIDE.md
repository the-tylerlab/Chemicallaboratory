# คู่มือการปรับปรุงและพัฒนา UX / UI (UI/UX Developer Guide)
**SciPortal Chemical Laboratory Management System**

> [!IMPORTANT]
> **กฎเหล็กสำคัญที่สุด (Golden Rule): "การแก้ไข UX/UI ห้ามไปยุ่งกับข้อมูลเด็ดขาด"**  
> ห้ามแก้ไข ลบ หรือเปลี่ยนแปลงไฟล์ในโฟลเดอร์ `data/`, schema ฐานข้อมูล, หรือ API endpoints ใน `server.js` ในระหว่างการทำงานด้านหน้าบ้าน (Frontend/Design)

---

## 1. แผนผังโซนความปลอดภัย (Safety Zone Map)

```
=============================================================================
🟢 GREEN ZONE (พื้นที่ปลอดภัย: ปรับแต่ง ดีไซน์ แก้ไข UX/UI ได้อย่างอิสระ)
=============================================================================
├── src/pages/                  -> หน้าจอหลักทั้ง 11 หน้า (Dashboard, Inventory, Admin ฯลฯ)
├── src/components/modals/           -> หน้าต่างป๊อปอัปและ Dialogs ทั้ง 19 ตัว (แยกเป็นอิสระ)
├── public/assets/css/             -> CSS Modules ที่ browser โหลดได้
│   ├── variables.css       -> โทเค็นสี, ฟอนต์, ขอบมน, เงา, ระยะห่าง (Design Tokens)
│   ├── base.css            -> CSS Reset, Typography (h1-h6, p)
│   ├── layout.css          -> โครงสร้าง Sidebar, Navbar, Panel Container
│   ├── components/         -> ปุ่ม (buttons), ฟอร์ม (forms), การ์ด (cards), ตาราง (tables), ป๊อปอัป (modals)
│   ├── pages/              -> สไตล์เฉพาะของแต่ละหน้าจอ (dashboard, lab-booking ฯลฯ)
│   ├── responsive.css      -> การแสดงผลบน iPad, Tablet และ Mobile
│   └── print.css           -> เทมเพลตสำหรับพิมพ์บาร์โค้ด ฉลากขวดสาร และใบเสร็จ
└── public/assets/           -> รูปภาพ ไอคอน และไฟล์ CSS/JS ที่ build แล้ว

=============================================================================
🔴 RED ZONE (พื้นที่หวงห้าม: ห้ามแก้ไขเมื่อทำงาน UX/UI)
=============================================================================
├── data/                   -> ฐานข้อมูล JSON ของระบบ (ห้ามแก้ไขโครงสร้างหรือข้อมูล)
├── server.js               -> Backend Express REST API Endpoints
├── migrations/             -> Database Migrations
└── tests/*.js       -> Automated Test Suites
```

---

## 2. ขั้นตอนการแก้ไข UI / UX ตามงานต่างๆ

### ก. การปรับแต่งธีม สี ฟอนต์ หรือขนาดขอบมน (Design Tokens)
1. เปิดไฟล์ [public/assets/css/variables.css](file:///Users/wongsakornduangkliang/CODE/Chemicallab/public/assets/css/variables.css)
2. แก้ไขตัวแปร CSS `:root` เช่น:
   - สีหลัก: `--primary-purple`, `--primary-light`, `--accent-color`
   - สถานะความปลอดภัย: `--status-safe`, `--status-warning`, `--status-danger`
   - ขอบมน: `--border-radius-sm`, `--border-radius-md`, `--border-radius-lg`
   - เงา: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
3. บันทึกไฟล์ แล้วรัน `npm run build:styles` เพื่ออัปเดต `public/assets/css/style.css`

---

### ข. การแก้ไขหน้าจอ (Pages)
หน้าจอหลักของระบบถูกแยกเป็นไฟล์ HTML ย่อยใน `src/pages/` ดังนี้:
- [src/pages/dashboard.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/dashboard.html): หน้าภาพรวม แดชบอร์ดสถานะห้องแล็บ สถิติคลัง
- [src/pages/all-items.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/all-items.html): หน้ารายการสารเคมีและเครื่องแก้วทั้งหมด
- [src/pages/add-item.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/add-item.html): ฟอร์มบันทึกรับเข้าพัสดุและเคมีภัณฑ์ใหม่
- [src/pages/borrow-return.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/borrow-return.html): ระบบยืม-คืนสารเคมีและอุปกรณ์
- [src/pages/lab-booking.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/lab-booking.html): ตารางจองห้องปฏิบัติการและปฏิทิน
- [src/pages/cabinet-layout.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/cabinet-layout.html): ผังตู้จัดเก็บสารเคมีมาตรฐานความปลอดภัย SHECU
- [src/pages/purchase-orders.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/purchase-orders.html): ระบบสั่งซื้อและใบขอจัดซื้อ (PO)
- [src/pages/notifications.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/notifications.html): ศูนย์แจ้งเตือนและรายการประกาศ
- [src/pages/reports.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/reports.html): รายงานสถิติและวิเคราะห์ข้อมูลงบประมาณ
- [src/pages/activity-logs.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/activity-logs.html): ประวัติการใช้งานระบบ (Audit Trail)
- [src/pages/admin.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/pages/admin.html): แผงควบคุมผู้ดูแลระบบ (Admin Deck)

**วิธีคอมไพล์หน้าจอ:**
```bash
# คอมไพล์ครั้งเดียว
npm run build:pages

# หรือเปิดโหมด Watch เพื่อ Rebuild อัตโนมัติทุกครั้งที่กด Save
npm run watch:pages
```

---

### ค. การแก้ไขหน้าต่างป๊อปอัป (Modals & Dialogs)
หน้าต่างป๊อปอัปทั้งหมดถูกแยกไว้ใน `src/components/modals/` ทำให้เปิดหาและปรับแก้ได้ง่าย ไม่ต้องเลื่อนหาในไฟล์ใหญ่:
- [src/components/modals/announcement-modal.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/announcement-modal.html): จัดการแถบประกาศหน้าแรก
- [src/components/modals/auth-modals.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/auth-modals.html): หน้าต่างเข้าสู่ระบบ (Login) และโปรไฟล์ผู้ใช้
- [src/components/modals/help-safety-modal.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/help-safety-modal.html): ศูนย์ข้อมูลความปลอดภัย SHECU และ SDS 16 หัวข้อ
- [src/components/modals/booking-success-modal.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/booking-success-modal.html): บัตร Passport ยืนยันการจองห้องแล็บ
- [src/components/modals/scanner-modal.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/scanner-modal.html): สแกนกล้องบาร์โค้ด & QR Code
- [src/components/modals/lab-room-modal.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/lab-room-modal.html): จัดการห้องปฏิบัติการ (ป้าย NYC Metro Subway)
- [src/components/modals/cabinet-manage-modals.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/cabinet-manage-modals.html): จัดการตู้จัดเก็บสารเคมี
- [src/components/modals/danger-zone-modal.html](file:///Users/wongsakornduangkliang/CODE/Chemicallab/src/components/modals/danger-zone-modal.html): ระบบยืนยันล้างข้อมูลแบบกดค้าง (Hold to confirm)

---

### ง. การแก้ไขสไตล์ CSS (Styles)
ทุกการปรับแต่งสไตล์ให้แก้ไขที่ไฟล์ย่อยใน `public/assets/css/` โดยตรง:
- ปุ่ม / Hover / Focus states: [public/assets/css/components/buttons.css](file:///Users/wongsakornduangkliang/CODE/Chemicallab/public/assets/css/components/buttons.css)
- อินพุต / ฟอร์ม / Dropdowns: [public/assets/css/components/forms.css](file:///Users/wongsakornduangkliang/CODE/Chemicallab/public/assets/css/components/forms.css)
- ตาราง / การแบ่งหน้า: [public/assets/css/components/tables.css](file:///Users/wongsakornduangkliang/CODE/Chemicallab/public/assets/css/components/tables.css)
- ป๊อปอัป / Dialog animations: [public/assets/css/components/modals.css](file:///Users/wongsakornduangkliang/CODE/Chemicallab/public/assets/css/components/modals.css)
- การแสดงผลมือถือ / แท็บเล็ต: [public/assets/css/responsive.css](file:///Users/wongsakornduangkliang/CODE/Chemicallab/public/assets/css/responsive.css)

---

## 3. การตรวจสอบความปลอดภัยหลังแก้ไข (Verification Checklist)

ก่อนงานที่อาจเขียนข้อมูล ให้สำรองด้วย `npm run backup:data` backend จะ snapshot ก่อนเขียน JSON โดยอัตโนมัติวันละครั้ง และใช้ atomic write ลดความเสี่ยงไฟล์เสียหาย

ทุกครั้งหลังทำงานด้าน UI/UX เสร็จสิ้น ให้รันคำสั่งตรวจสอบต่อไปนี้:

```bash
# 1. คอมไพล์หน้าจอ HTML ให้เป็นเวอร์ชันล่าสุด
npm run build:pages

# 2. ตรวจสอบความสมบูรณ์ของฐานข้อมูลว่าไม่มีการแตะต้องหรือทำให้ข้อมูลเสียหาย
npm run verify:data

# 3. รันชุดทดสอบระบบทั้งหมด (ระบบความปลอดภัย, การจอง, คลัง)
npm run test:all
```

เมื่อทั้ง 3 คำสั่งผ่าน 100% แสดงว่าการปรับแต่ง UI/UX ปลอดภัยและพร้อมส่งมอบงานทันที!
