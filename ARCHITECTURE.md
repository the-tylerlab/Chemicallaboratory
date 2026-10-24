# โครงสร้างโปรเจกต์ SciPortal

โปรเจกต์ใช้โครงสร้างเว็บไซต์พื้นฐานโดยแยกไฟล์ต้นทางออกจากไฟล์ที่เปิดให้ browser เข้าถึง

```text
Chemicallab/
├── public/                 # ไฟล์ที่เว็บเซิร์ฟเวอร์เปิดเผยต่อ browser เท่านั้น
│   ├── assets/             # แบ่งตามประเภทไฟล์
│   │   ├── css/            # CSS entry, components, pages, Tailwind
│   │   ├── js/             # app bundle และ libraries
│   │   ├── images/         # ภาพและ GHS symbols
│   │   ├── logos/          # โลโก้
│   │   ├── icons/          # PWA icons
│   │   └── fonts/          # ฟอนต์
│   ├── index.html          # HTML ที่ build แล้ว
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # PWA service worker
├── src/                    # โค้ดและแม่แบบต้นทาง
│   ├── auth/, inventory/, booking/, ... # โค้ดแบ่งตามโดเมน
│   ├── pages/              # HTML partials ของแต่ละหน้า
│   ├── components/modals/ # HTML partials ของ dialogs/modals
│   ├── styles/global.css   # Tailwind input
│   └── index.template.html # แม่แบบสำหรับประกอบหน้า
├── tests/                  # ชุดทดสอบ
├── scripts/                # build, data, sync และ maintenance tools
├── data/                   # ข้อมูล local ของ backend; อยู่นอก public/
│   └── backups/            # snapshot ที่ถูก ignore โดย Git
├── api/                    # Vercel API entry
├── migrations/             # Database migrations
├── docs/                   # คู่มือและเอกสารฐานข้อมูล
├── security-tests/         # security/performance/UX evidence
├── server.js               # Express backend
└── package.json
```

## การป้องกันข้อมูล

- Express เสิร์ฟ static files จาก `public/` เท่านั้น ส่วน `data/`, `.env`, migrations และ scripts อยู่นอก static root
- `data/*.json`, secrets และ `data/backups/` ถูกละเว้นโดย Git; ข้อมูลจริงไม่ควรถูก commit
- `npm run backup:data` สร้าง snapshot แบบมี timestamp ด้วยตนเอง
- ก่อน backend เขียนทับ JSON ที่มีอยู่ จะสร้าง snapshot อัตโนมัติวันละครั้งที่ `data/backups/auto-YYYY-MM-DD/`
- การเขียน JSON ของ backend ใช้ไฟล์ชั่วคราวและ atomic rename เพื่อลดโอกาสไฟล์เสียหายหาก process หยุดกลางการเขียน
- `npm run verify:data` ตรวจ JSON ทุกไฟล์ใต้ `data/` โดยไม่แก้เนื้อหา
- ข้อมูล production ที่อยู่ใน Supabase ต้องสำรองด้วยระบบ backup ของฐานข้อมูลแยกจาก snapshot local นี้

## แก้ไขและ build

- HTML: `src/pages/` และ `src/components/modals/`; build ด้วย `npm run build:pages`
- JavaScript modules: `src/<domain>/`; bundle ที่ใช้งานปัจจุบันคือ `public/assets/js/main.js`
- CSS modules และ entry: `public/assets/css/`; build ด้วย `npm run build:styles`
- Tailwind input: `src/styles/global.css`; output: `public/assets/css/tailwind.css`
- ทดสอบ: `tests/`; ใช้ `npm run test:all`

## แนวทางเปลี่ยน schema หรือข้อมูล

1. สำรองข้อมูลก่อน import, migration หรือการเปลี่ยนแปลงที่เขียนข้อมูล: `npm run backup:data`
2. เพิ่ม migration ใหม่แทนการแก้ migration ที่ถูกใช้ไปแล้ว
3. ย้าย/แปลงข้อมูลด้วยขั้นตอนที่รักษาค่าเดิมและตรวจจำนวนระเบียนก่อน-หลัง
4. ตรวจ `npm run verify:data` และชุดทดสอบที่เกี่ยวข้องก่อนส่งมอบ
5. อย่าใช้ UI cache หรือ `localStorage` เป็นแหล่งข้อมูลหลักของข้อมูลที่ต้องแชร์หรือเก็บประวัติ
