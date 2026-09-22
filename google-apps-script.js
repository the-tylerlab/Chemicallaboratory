/**
 * Chemical Laboratory Management System - Google Sheets Realtime Backup & Academic Logbook Sync
 * ==============================================================================
 * วิธีใช้งาน:
 * 1. เปิด Google Sheet ที่ต้องการสำรองข้อมูล
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดใน Code.gs แล้วนำโค้ดด้านล่างนี้ไปวางแทนที่ทั้งหมด
 * 4. ด้านบนเลือกฟังก์ชัน "autoOrganizeCleanSheets" แล้วกดปุ่ม Run (▶️)
 *    - ระบบจะสร้าง 0.Dashboard + 7 แท็บมาตรฐาน + แท็บสมุดบันทึกการใช้ห้องแยกตามห้อง (Logbook) อัตโนมัติ
 * 5. กด Deploy (การทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้รายการใหม่)
 *    - Type: Web app
 *    - Execute as: Me (ฉัน)
 *    - Who has access: Anyone (ทุกคน)
 * ==============================================================================
 */

// -------------------------------------------------------------
// MAP ROOM NAMES TO TAB CONFIGURATIONS
// -------------------------------------------------------------
var ROOM_CONFIGS = [
  {
    code: 'Lab 5',
    tabName: '2.ห้องพัฒนาศูนย์สสวท. อาคารราฟาแอล',
    title: 'ห้องพัฒนาศูนย์ สสวท. (วิทยาศาสตร์) อาคารราฟาเอล ภาคเรียนที่ 1/2569',
    aliases: ['Lab 5', 'ห้องศูนย์ สสวท.', 'ห้องพัฒนาศูนย์สสวท', 'อาคารราฟาแอล', 'อาคารราฟาเอล']
  },
  {
    code: 'Lab 6',
    tabName: '3.ห้องปฏิบัติการทางวิทยาศาสตร์อาคารอัสสัมชัญ',
    title: 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารอัสสัมชัญ ภาคเรียนที่ 1/2569',
    aliases: ['Lab 6', 'ห้องปฏิบัติการทางวิทยาศาสตร์อาคารอัสสัมชัญ', 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารอัสสัมชัญ']
  },
  {
    code: 'Lab 1',
    tabName: '4.ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ',
    title: 'ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ ภาคเรียนที่ 1/2569',
    aliases: ['Lab 1', 'ห้องปฏิบัติการเคมี', 'ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ']
  },
  {
    code: 'Lab 2',
    tabName: '5.ห้องปฏิบัติการ ฟิสิกส์ อาคารเซนต์ปีเตอร์',
    title: 'ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์ ภาคเรียนที่ 1/2569',
    aliases: ['Lab 2', 'ห้องปฏิบัติการฟิสิกส์', 'ห้องปฏิบัติการ ฟิสิกส์', 'ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์']
  },
  {
    code: 'Lab 3',
    tabName: '6.ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์',
    title: 'ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์ ภาคเรียนที่ 1/2569',
    aliases: ['Lab 3', 'ห้องปฏิบัติการชีววิทยา', 'ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์']
  },
  {
    code: 'Lab 4',
    tabName: '7.ห้องปฏิบัติการวิทยาศาสตร์ อาคารราฟาเอล',
    title: 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารราฟาเอล ภาคเรียนที่ 1/2569',
    aliases: ['Lab 4', 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารราฟาเอล']
  },
  {
    code: 'Lab 7',
    tabName: '8.ห้องศูนย์ STEM CENTER',
    title: 'ห้องศูนย์ STEM CENTER ภาคเรียนที่ 1/2569',
    aliases: ['Lab 7', 'ห้องศูนย์ STEM CENTER', 'STEM']
  },
  {
    code: 'Lab 8',
    tabName: '9.ห้องปฏิบัติการวิทยาศาสตร์ (EP) อาคารยอห์น แมรี่',
    title: 'ห้องปฏิบัติการวิทยาศาสตร์ (EP) อาคารยอห์น แมรี่ ภาคเรียนที่ 1/2569',
    aliases: ['Lab 8', 'EP', 'อาคารยอห์น แมรี่']
  }
];

// -------------------------------------------------------------
// CUSTOM MENU IN GOOGLE SHEETS
// -------------------------------------------------------------
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔬 เมนูระบบห้องแล็บ')
    .addItem('📊 จัดระเบียบชีตทั้งหมด (Auto Organize & Setup)', 'autoOrganizeCleanSheets')
    .addItem('🔄 ซิงค์ข้อมูลการจองลงสมุดบันทึกรายห้อง (Sync Room Logs)', 'syncAllRoomLogSheets')
    .addToUi();
}

// -------------------------------------------------------------
// 1-CLICK AUTO SETUP & DASHBOARD CREATOR (0.Dashboard + 7 Tabs + Room Logs)
// -------------------------------------------------------------
function autoOrganizeCleanSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. โครงสร้าง 7 แท็บมาตรฐานภาษาอังกฤษ (Raw Data)
  var schemas = {
    'Items': [
      'code', 'name', 'category', 'qty', 'unit', 'minAlert', 'expiry', 
      'room', 'cabinet', 'shelf', 'damagedQty', 'createdAt'
    ],
    'Transactions': [
      'id', 'code', 'itemCode', 'itemName', 'qty', 'unit', 'borrower', 
      'room', 'date', 'slot', 'notes', 'status', 'type', 'timestamp', 'createdAt'
    ],
    'Bookings': [
      'id', 'room', 'date', 'slot', 'gradeLevel', 'studentCount', 'purpose', 'bookerName', 
      'prepItems', 'status', 'createdAt'
    ],
    'Purchase_Orders': [
      'id', 'code', 'name', 'academicYear', 'semester', 
      'unitPrice', 'quantity', 'totalPrice', 'discount', 'date'
    ],
    'Users': [
      'id', 'teacherId', 'name', 'department', 'email', 'role', 
      'roleName', 'assignedRooms', 'initials', 'color', 'isActive', 'createdAt'
    ],
    'Audit_Logs': [
      'id', 'action', 'details', 'timestamp', 'user'
    ],
    'Announcements': [
      'enabled', 'text', 'badgeText', 'speed', 'gap', 
      'theme', 'pauseOnHover', 'emergencyContacts', 'updatedAt'
    ]
  };

  // สร้างหรือตรวจสอบ 7 แท็บมาตรฐาน
  Object.keys(schemas).forEach(function(tabName) {
    var sheet = ss.getSheetByName(tabName);
    var headers = schemas[tabName];

    if (!sheet) {
      sheet = ss.insertSheet(tabName);
      sheet.appendRow(headers);
    } else {
      var currentHeaders = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
      if (currentHeaders.length === 0 || currentHeaders[0] === '') {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
    }

    var lastCol = headers.length;
    sheet.getRange(1, 1, 1, lastCol)
         .setBackground('#1e293b')
         .setFontColor('#ffffff')
         .setFontWeight('bold')
         .setFontSize(10)
         .setHorizontalAlignment('center')
         .setVerticalAlignment('middle');
    
    sheet.setRowHeight(1, 32);
    sheet.setFrozenRows(1);
  });

  // 2. สร้างแท็บ "0.Dashboard" (ภาพรวมแดชบอร์ดสรุปสถิติอัตโนมัติ)
  var dashSheet = ss.getSheetByName('0.Dashboard') || ss.getSheetByName('0.ภาพรวม');
  if (!dashSheet) {
    dashSheet = ss.insertSheet('0.Dashboard', 0); // วางไว้เป็นชีตแรกสุด
  } else {
    dashSheet.setName('0.Dashboard');
  }

  dashSheet.clear();
  dashSheet.setHiddenGridlines(false);

  // หัวข้อแดชบอร์ด
  dashSheet.getRange('A1:G1').merge()
           .setValue('📊 แดชบอร์ดภาพรวมห้องปฏิบัติการวิทยาศาสตร์ (Laboratory Summary & Analytics)')
           .setBackground('#0f172a')
           .setFontColor('#ffffff')
           .setFontSize(14)
           .setFontWeight('bold')
           .setHorizontalAlignment('center')
           .setVerticalAlignment('middle');
  dashSheet.setRowHeight(1, 44);

  // คำอธิบายและเวลาอัปเดต
  dashSheet.getRange('A2:G2').merge()
           .setValue('อัปเดตข้อมูลอัตโนมัติแบบเรียลไทม์จากชีตข้อมูลหลัก (Items, Bookings, Transactions, Users, Purchase_Orders)')
           .setFontSize(10)
           .setFontColor('#64748b')
           .setHorizontalAlignment('center');
  dashSheet.setRowHeight(2, 22);

  // กล่องสถิติที่ 1: คลังพัสดุและสารเคมี
  dashSheet.getRange('A4:C4').merge().setValue('📦 สถิติคลังสารเคมีและอุปกรณ์').setBackground('#e0f2fe').setFontColor('#0369a1').setFontWeight('bold');
  dashSheet.getRange('A5').setValue('สารเคมีและอุปกรณ์ทั้งหมด:');
  dashSheet.getRange('C5').setFormula('=IFERROR(COUNTA(Items!A2:A), 0)').setFontWeight('bold').setHorizontalAlignment('right');
  
  dashSheet.getRange('A6').setValue('• สารเคมี:');
  dashSheet.getRange('C6').setFormula('=IFERROR(COUNTIF(Items!C2:C, "สารเคมี"), 0)').setHorizontalAlignment('right');
  
  dashSheet.getRange('A7').setValue('• อุปกรณ์ / เครื่องแก้ว:');
  dashSheet.getRange('C7').setFormula('=IFERROR(COUNTIF(Items!C2:C, "<>สารเคมี") - COUNTIF(Items!C2:C, ""), 0)').setHorizontalAlignment('right');
  
  dashSheet.getRange('A8').setValue('⚠️ รายการสต็อกต่ำกว่าเกณฑ์:');
  dashSheet.getRange('C8').setFormula('=IFERROR(COUNTIF(Items!D2:D, "<=2"), 0)').setFontColor('#ea580c').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('A9').setValue('❌ รายการชำรุดสะสม:');
  dashSheet.getRange('C9').setFormula('=IFERROR(SUM(Items!K2:K), 0)').setFontColor('#dc2626').setHorizontalAlignment('right');

  // กล่องสถิติที่ 2: การจองห้องปฏิบัติการและยืมคืน
  dashSheet.getRange('E4:G4').merge().setValue('🔬 สถิติการจองแล็บและการยืมคืน').setBackground('#f3e8ff').setFontColor('#7e22ce').setFontWeight('bold');
  dashSheet.getRange('E5').setValue('รายการจองห้องแล็บทั้งหมด:');
  dashSheet.getRange('G5').setFormula('=IFERROR(COUNTA(Bookings!A2:A), 0)').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E6').setValue('• รออนุมัติการจอง:');
  dashSheet.getRange('G6').setFormula('=IFERROR(COUNTIF(Bookings!J2:J, "รออนุมัติ") + COUNTIF(Bookings!J2:J, "pending"), 0)').setFontColor('#ea580c').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E7').setValue('• อนุมัติ / เสร็จสิ้นแล้ว:');
  dashSheet.getRange('G7').setFormula('=IFERROR(COUNTIF(Bookings!J2:J, "อนุมัติแล้ว") + COUNTIF(Bookings!J2:J, "approved") + COUNTIF(Bookings!J2:J, "เสร็จสิ้น"), 0)').setHorizontalAlignment('right');

  dashSheet.getRange('E8').setValue('📋 ประวัติการทำรายการยืม-คืน:');
  dashSheet.getRange('G8').setFormula('=IFERROR(COUNTA(Transactions!A2:A), 0)').setHorizontalAlignment('right');

  dashSheet.getRange('E9').setValue('🔄 กำลังยืมใช้งานอยู่ในขณะนี้:');
  dashSheet.getRange('G9').setFormula('=IFERROR(COUNTIF(Transactions!L2:L, "กำลังยืม"), 0)').setFontColor('#2563eb').setFontWeight('bold').setHorizontalAlignment('right');

  // กล่องสถิติที่ 3: ผู้ใช้งานและงบประมาณ
  dashSheet.getRange('A11:C11').merge().setValue('👥 ผู้ใช้งานและระบบสิทธิ์').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold');
  dashSheet.getRange('A12').setValue('ผู้ใช้งานทั้งหมดในระบบ:');
  dashSheet.getRange('C12').setFormula('=IFERROR(COUNTA(Users!A2:A), 0)').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('A13').setValue('• ครูผู้สอน (L1):');
  dashSheet.getRange('C13').setFormula('=IFERROR(COUNTIF(Users!F2:F, "L1"), 0)').setHorizontalAlignment('right');

  dashSheet.getRange('A14').setValue('• เจ้าหน้าที่แล็บ (L2):');
  dashSheet.getRange('C14').setFormula('=IFERROR(COUNTIF(Users!F2:F, "L2"), 0)').setHorizontalAlignment('right');

  dashSheet.getRange('A15').setValue('• ผู้ดูแลระบบ / ผู้บริหาร (L3-L4):');
  dashSheet.getRange('C15').setFormula('=IFERROR(COUNTIF(Users!F2:F, "L3") + COUNTIF(Users!F2:F, "L4"), 0)').setHorizontalAlignment('right');

  dashSheet.getRange('E11:G11').merge().setValue('💰 คำสั่งซื้อและงบประมาณ').setBackground('#dcfce7').setFontColor('#166534').setFontWeight('bold');
  dashSheet.getRange('E12').setValue('จำนวนใบสั่งซื้อทั้งหมด:');
  dashSheet.getRange('G12').setFormula('=IFERROR(COUNTA(Purchase_Orders!A2:A), 0)').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E13').setValue('ยอดรวมงบประมาณจัดซื้อ:');
  dashSheet.getRange('G13').setFormula('=IFERROR(SUM(Purchase_Orders!G2:G), 0)').setFontWeight('bold').setFontColor('#15803d').setHorizontalAlignment('right');

  // ปรับความกว้างคอลัมน์ให้อ่านง่าย
  dashSheet.setColumnWidth(1, 220);
  dashSheet.setColumnWidth(2, 20);
  dashSheet.setColumnWidth(3, 100);
  dashSheet.setColumnWidth(4, 30);
  dashSheet.setColumnWidth(5, 220);
  dashSheet.setColumnWidth(6, 20);
  dashSheet.setColumnWidth(7, 100);

  // 3. สร้างแท็บสมุดบันทึกการใช้ห้องแยกตามห้อง (Logbook Sheets - รูปแบบตามโรงเรียน)
  ROOM_CONFIGS.forEach(function(cfg) {
    setupRoomLogSheet(ss, cfg);
  });

  // 4. ซิงค์ข้อมูลการจองที่มีอยู่แล้วลงแท็บห้องแต่ละห้อง
  syncAllRoomLogSheets();

  // ลบแท็บซ้ำซ้อนเดิม
  var oldTabs = ['Sheet1', 'ชีต1', 'System', 'การจองห้องแล็บ', 'รายการอุปกรณ์', 'รายการสารเคมี'];
  oldTabs.forEach(function(t) {
    var s = ss.getSheetByName(t);
    if (s && ss.getSheets().length > 1) {
      try { ss.deleteSheet(s); } catch(e) {}
    }
  });

  ss.setActiveSheet(dashSheet);
  ss.toast('✅ สร้าง Dashboard, 7 แท็บมาตรฐาน และสมุดบันทึกรายห้องสำเร็จเรียบร้อย!', 'สำเร็จ', 5);
}

// -------------------------------------------------------------
// SETUP INDIVIDUAL ROOM LOG SHEET TEMPLATE (2-ROW HEADER)
// -------------------------------------------------------------
function setupRoomLogSheet(ss, cfg) {
  var sheet = ss.getSheetByName(cfg.tabName);
  if (!sheet) {
    sheet = ss.insertSheet(cfg.tabName);
  }

  // Row 1: Merged Title Header
  sheet.getRange('A1:G1').merge()
       .setValue(cfg.title)
       .setBackground('#a7f3d0') // Soft Mint Green Header
       .setFontColor('#064e3b')
       .setFontWeight('bold')
       .setFontSize(11)
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);

  // Row 2: Standard School Log Column Headers
  var headers = [
    'ลำดับ',
    'วัน/เดือน/ปี ที่ใช้งาน',
    'เวลาที่เข้าใช้',
    'ระบุระดับชั้นของนักเรียนที่เข้าใช้งาน',
    'จำนวนนักเรียนที่เข้าใช้งานทั้งสิ้น',
    'ระบุกิจกรรมที่ใช้ (เช่น ทำ Lab เรื่อง..................../ การเรียนการสอนเรื่อง......./กิจกรรมชมรม เป็นต้น)',
    'ลงชื่อคุณครู (พิมพ์เฉพาะชื่อเท่านั้น)'
  ];

  sheet.getRange(2, 1, 1, 7)
       .setValues([headers])
       .setBackground('#f8fafc')
       .setFontColor('#1e293b')
       .setFontWeight('bold')
       .setFontSize(9.5)
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle')
       .setWrap(true);
  sheet.setRowHeight(2, 44);

  // Column Widths
  sheet.setColumnWidth(1, 60);  // ลำดับ
  sheet.setColumnWidth(2, 120); // วันที่
  sheet.setColumnWidth(3, 110); // เวลา
  sheet.setColumnWidth(4, 140); // ระดับชั้น
  sheet.setColumnWidth(5, 120); // จำนวนนักเรียน
  sheet.setColumnWidth(6, 380); // กิจกรรม
  sheet.setColumnWidth(7, 160); // ชื่อครู

  sheet.setFrozenRows(2);
}

// -------------------------------------------------------------
// SYNC ALL BOOKINGS INTO ROOM LOG SHEETS
// -------------------------------------------------------------
function syncAllRoomLogSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var bookingSheet = ss.getSheetByName('Bookings');
  if (!bookingSheet || bookingSheet.getLastRow() < 2) return;

  var data = bookingSheet.getDataRange().getValues();
  var headers = data[0];

  // Helper index lookups (supports both English and Thai schema)
  var colId = headers.indexOf('id');
  var colRoom = headers.indexOf('room') !== -1 ? headers.indexOf('room') : headers.indexOf('ห้องปฏิบัติการ');
  var colDate = headers.indexOf('date') !== -1 ? headers.indexOf('date') : headers.indexOf('วัน/เดือน/ปี ที่ใช้งาน');
  var colSlot = headers.indexOf('slot') !== -1 ? headers.indexOf('slot') : headers.indexOf('เวลาที่เข้าใช้');
  var colGrade = headers.indexOf('gradeLevel') !== -1 ? headers.indexOf('gradeLevel') : headers.indexOf('ระบุระดับชั้นของนักเรียนที่เข้าใช้งาน');
  var colCount = headers.indexOf('studentCount') !== -1 ? headers.indexOf('studentCount') : headers.indexOf('จำนวนนักเรียนที่เข้าใช้งานทั้งหมด');
  if (colCount === -1) colCount = headers.indexOf('จำนวนนักเรียนที่เข้าใช้งานทั้งสิ้น');
  var colPurpose = headers.indexOf('purpose') !== -1 ? headers.indexOf('purpose') : headers.indexOf('ระบุกิจกรรมที่ใช้ (เช่น ทำ Lab เรื่อง............../การเรียนการสอนเรื่อง....../กิจกรรมชมรม เป็นต้น)');
  if (colPurpose === -1) colPurpose = headers.indexOf('ระบุกิจกรรมที่ใช้ (เช่น ทำ Lab เรื่อง..................../ การเรียนการสอนเรื่อง......./กิจกรรมชมรม เป็นต้น)');
  var colBooker = headers.indexOf('bookerName') !== -1 ? headers.indexOf('bookerName') : headers.indexOf('ลงชื่อคุณครู (พิมพ์เฉพาะชื่อเท่านั้น)');
  var colStatus = headers.indexOf('status') !== -1 ? headers.indexOf('status') : headers.indexOf('สถานะ');

  // Group approved/active bookings by room
  var roomBookings = {};
  ROOM_CONFIGS.forEach(function(cfg) {
    roomBookings[cfg.code] = [];
  });

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = String(colStatus !== -1 ? row[colStatus] : '').trim().toLowerCase();
    
    // Only log approved or non-rejected bookings in the official logbook
    if (status === 'rejected' || status === 'ปฏิเสธ' || status === 'cancelled') continue;

    var rawRoom = String(colRoom !== -1 ? row[colRoom] : '').trim();
    var matchedCfg = findRoomConfig(rawRoom);
    if (!matchedCfg) continue;

    var dateVal = colDate !== -1 ? formatDateForLog(row[colDate]) : '';
    var slotVal = colSlot !== -1 ? formatSlotForLog(row[colSlot]) : '';
    var gradeVal = colGrade !== -1 ? String(row[colGrade] || '').trim() : '';
    var countVal = colCount !== -1 ? String(row[colCount] || '').replace(/[^0-9]/g, '') : '';
    var purposeVal = colPurpose !== -1 ? String(row[colPurpose] || '').trim() : '';
    var bookerVal = colBooker !== -1 ? String(row[colBooker] || '').trim() : '';

    roomBookings[matchedCfg.code].push({
      date: dateVal,
      slot: slotVal,
      grade: gradeVal || '-',
      count: countVal ? Number(countVal) : '-',
      purpose: purposeVal,
      booker: bookerVal,
      rawDate: row[colDate]
    });
  }

  // Write each room's logbook cleanly
  ROOM_CONFIGS.forEach(function(cfg) {
    var sheet = ss.getSheetByName(cfg.tabName);
    if (!sheet) {
      setupRoomLogSheet(ss, cfg);
      sheet = ss.getSheetByName(cfg.tabName);
    }

    // Clear old data rows below header (Row 3 onwards)
    var lastRow = sheet.getLastRow();
    if (lastRow > 2) {
      sheet.getRange(3, 1, lastRow - 2, 7).clearContent().clearFormat();
    }

    var list = roomBookings[cfg.code] || [];
    if (list.length === 0) return;

    var rows = list.map(function(item, idx) {
      return [
        idx + 1,
        item.date,
        item.slot,
        item.grade,
        item.count,
        item.purpose,
        item.booker
      ];
    });

    var range = sheet.getRange(3, 1, rows.length, 7);
    range.setValues(rows)
         .setFontSize(9.5)
         .setVerticalAlignment('middle')
         .setWrap(true);

    // Alignment per column
    sheet.getRange(3, 1, rows.length, 1).setHorizontalAlignment('center').setFontWeight('bold'); // ลำดับ
    sheet.getRange(3, 2, rows.length, 1).setHorizontalAlignment('center'); // วันที่
    sheet.getRange(3, 3, rows.length, 1).setHorizontalAlignment('center'); // เวลา
    sheet.getRange(3, 4, rows.length, 1).setHorizontalAlignment('center'); // ชั้น
    sheet.getRange(3, 5, rows.length, 1).setHorizontalAlignment('center'); // จำนวน
    sheet.getRange(3, 6, rows.length, 1).setHorizontalAlignment('left');   // กิจกรรม
    sheet.getRange(3, 7, rows.length, 1).setHorizontalAlignment('center'); // ชื่อครู

    // Gridlines & borders
    range.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  });
}

function findRoomConfig(rawRoom) {
  if (!rawRoom) return null;
  for (var i = 0; i < ROOM_CONFIGS.length; i++) {
    var cfg = ROOM_CONFIGS[i];
    if (cfg.code.toLowerCase() === rawRoom.toLowerCase() || cfg.tabName === rawRoom) return cfg;
    for (var j = 0; j < cfg.aliases.length; j++) {
      if (rawRoom.toLowerCase().indexOf(cfg.aliases[j].toLowerCase()) !== -1) return cfg;
    }
  }
  return null;
}

function formatDateForLog(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var d = ('0' + val.getDate()).slice(-2);
    var m = ('0' + (val.getMonth() + 1)).slice(-2);
    var y = val.getFullYear();
    return d + '/' + m + '/' + y;
  }
  var s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    var p = s.split('T')[0].split('-');
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  return s;
}

function formatSlotForLog(slot) {
  if (!slot) return '';
  var s = String(slot).trim();
  // If slot contains time like 13:20 - 15:00 or คาบ 6: 13:20...
  if (s.indexOf('(') !== -1 && s.indexOf(')') !== -1) {
    var m = s.match(/\(([^)]+)\)/);
    if (m) return m[1].replace(/:/g, '.');
  }
  return s.replace(/:/g, '.');
}

// -------------------------------------------------------------
// WEBHOOK HANDLER FOR REALTIME SYNC (doPost & doGet)
// -------------------------------------------------------------
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "No POST body received" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;       // 'UPSERT', 'DELETE', or 'PING'
    var table = payload.table;         // 'Items', 'Transactions', 'Bookings', 'Purchase_Orders', 'Users', 'Audit_Logs', 'Announcements'
    var data = payload.data;           // Object data
    var keyField = payload.keyField || 'id';

    if (action === 'PING') {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Active" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!table || !data) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Missing table or data" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(table);
    if (!sheet) {
      sheet = ss.insertSheet(table);
    }

    var result = (action === 'DELETE') ? deleteRow(sheet, data, keyField) : upsertRow(sheet, data, keyField);

    // If Bookings table is modified, automatically sync room logbook sheets
    if (table === 'Bookings') {
      try {
        syncAllRoomLogSheets();
      } catch(syncErr) {}
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      result: result 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "active", 
    message: "Chemical Lab Realtime Backup & Logbook Webhook is running." 
  })).setMimeType(ContentService.MimeType.JSON);
}

function upsertRow(sheet, data, keyField) {
  var lastRow = sheet.getLastRow();
  var headers = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  if (headers.length === 0) {
    headers = Object.keys(data);
    sheet.appendRow(headers);
  }
  var keyCol = headers.indexOf(keyField);
  var keyVal = data[keyField];
  var rowVals = headers.map(function(h) { 
    var v = data[h];
    return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v !== undefined ? v : "");
  });

  if (keyCol !== -1 && keyVal && lastRow > 1) {
    var ids = sheet.getRange(2, keyCol + 1, lastRow - 1, 1).getValues();
    for (var i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim() === String(keyVal).trim()) {
        sheet.getRange(i + 2, 1, 1, headers.length).setValues([rowVals]);
        return "updated_row_" + (i + 2);
      }
    }
  }
  sheet.appendRow(rowVals);
  return "inserted_new_row";
}

function deleteRow(sheet, data, keyField) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return "sheet_empty";
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var keyCol = headers.indexOf(keyField);
  var keyVal = data[keyField];
  if (keyCol === -1 || !keyVal) return "key_not_found";
  var ids = sheet.getRange(2, keyCol + 1, lastRow - 1, 1).getValues();
  for (var i = ids.length - 1; i >= 0; i--) {
    if (String(ids[i][0]).trim() === String(keyVal).trim()) {
      sheet.deleteRow(i + 2);
      return "deleted_row_" + (i + 2);
    }
  }
  return "row_not_found";
}
