/**
 * Chemical Laboratory Management System - Google Sheets Realtime Backup & Academic Logbook
 * ==============================================================================
 * โครงสร้างชีตมาตรฐาน 8 แท็บ:
 * 0.Dashboard        -> ภาพรวมสถิติและแดชบอร์ดสรุปผลอัตโนมัติ
 * 1.Items            -> ฐานข้อมูลสารเคมี อุปกรณ์ และครุภัณฑ์
 * 2.Transactions     -> บันทึกประวัติการเบิก-จ่าย-ยืม-คืน
 * 3.Bookings         -> สมุดบันทึกการใช้ห้องปฏิบัติการวิทยาศาสตร์ (รวมทุกห้องในแท็บเดียว)
 * 4.Purchase_Orders  -> คำสั่งซื้อและงบประมาณจัดซื้อ
 * 5.Users            -> บัญชีผู้ใช้งานและระดับสิทธิ์ (L1 - L4)
 * 6.Audit_Logs       -> บันทึกประวัติการทำงานของระบบ (Audit Trail)
 * 7. Announcements   -> ประชาสัมพันธ์และเบอร์โทรฉุกเฉิน
 * ==============================================================================
 * วิธีใช้งาน:
 * 1. เปิด Google Sheet ที่ต้องการใช้งาน
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดใน Code.gs แล้วนำโค้ดด้านล่างนี้ไปวางแทนที่ทั้งหมด
 * 4. ด้านบนเลือกฟังก์ชัน "autoOrganizeCleanSheets" แล้วกดปุ่ม Run (▶️)
 *    - ระบบจะเปลี่ยนชื่อ/ย้ายข้อมูลเดิมเข้าสู่ 8 แท็บมาตรฐานอย่างถูกต้อง
 *    - ลบชีตส่วนเกินหรือแท็บแยกห้องเดิมทิ้งทั้งหมดอัตโนมัติ
 * 5. กด Deploy (การทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้รายการใหม่)
 *    - Type: Web app
 *    - Execute as: Me (ฉัน)
 *    - Who has access: Anyone (ทุกคน)
 * ==============================================================================
 */

// -------------------------------------------------------------
// TAB MAPPING & CANONICAL NAMES
// -------------------------------------------------------------
var CANONICAL_TABS = {
  DASHBOARD: '0.Dashboard',
  ITEMS: '1.Items',
  TRANSACTIONS: '2.Transactions',
  BOOKINGS: '3.Bookings',
  PURCHASE_ORDERS: '4.Purchase_Orders',
  USERS: '5.Users',
  AUDIT_LOGS: '6.Audit_Logs',
  ANNOUNCEMENTS: '7. Announcements'
};

var ALL_VALID_SHEET_NAMES = [
  '0.Dashboard',
  '1.Items',
  '2.Transactions',
  '3.Bookings',
  '4.Purchase_Orders',
  '5.Users',
  '6.Audit_Logs',
  '7. Announcements'
];

function resolveSheetName(tableName) {
  if (!tableName) return null;
  var raw = String(tableName).trim();
  var lower = raw.toLowerCase().replace(/[\s_\-\.]/g, '');

  if (lower.includes('dash') || lower.includes('ภาพรวม')) return CANONICAL_TABS.DASHBOARD;
  if (lower.includes('item') || lower.includes('สารเคมี') || lower.includes('อุปกรณ์')) return CANONICAL_TABS.ITEMS;
  if (lower.includes('trans') || lower.includes('ยืม') || lower.includes('เบิก')) return CANONICAL_TABS.TRANSACTIONS;
  if (lower.includes('book') || lower.includes('จอง') || lower.includes('ห้องแล็บ')) return CANONICAL_TABS.BOOKINGS;
  if (lower.includes('purch') || lower.includes('order') || lower.includes('สั่งซื้อ')) return CANONICAL_TABS.PURCHASE_ORDERS;
  if (lower.includes('user') || lower.includes('ผู้ใช้') || lower.includes('ครู')) return CANONICAL_TABS.USERS;
  if (lower.includes('audit') || lower.includes('log') || lower.includes('ประวัติ')) return CANONICAL_TABS.AUDIT_LOGS;
  if (lower.includes('announc') || lower.includes('ประชาสัมพันธ์') || lower.includes('emergency')) return CANONICAL_TABS.ANNOUNCEMENTS;

  return raw;
}

function getOrCreateCanonicalSheet(ss, tableName) {
  var resolvedName = resolveSheetName(tableName) || tableName;
  var sheet = ss.getSheetByName(resolvedName);
  if (sheet) return sheet;

  // Check if legacy un-numbered sheet exists (e.g. "Items") and rename it
  var legacyName = resolvedName.replace(/^\d+\.\s*/, '');
  var legacySheet = ss.getSheetByName(legacyName);
  if (legacySheet) {
    legacySheet.setName(resolvedName);
    return legacySheet;
  }

  return ss.insertSheet(resolvedName);
}

// -------------------------------------------------------------
// CUSTOM MENU IN GOOGLE SHEETS
// -------------------------------------------------------------
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔬 เมนูระบบห้องแล็บ')
    .addItem('📊 จัดระเบียบฐานข้อมูลเป็น 8 แท็บมาตรฐาน (0.Dashboard - 7. Announcements)', 'autoOrganizeCleanSheets')
    .addSeparator()
    .addItem('🏢 เรียงตาม: ห้องปฏิบัติการ (Sort by Room)', 'sortByRoom')
    .addItem('📅 เรียงตาม: วันที่และเวลาใช้งาน (Sort by Date & Time)', 'sortByDateTime')
    .addItem('👨‍🏫 เรียงตาม: ชื่อคุณครูผู้สอน (Sort by Teacher)', 'sortByTeacher')
    .addSeparator()
    .addItem('🔄 รีเฟรชลำดับตัวเลข 1, 2, 3... (Re-number Rows)', 'renumberBookingRows')
    .addItem('🗑️ เคลียร์ชีตส่วนเกินที่ไม่ได้ใช้งานทิ้ง', 'cleanExtraSheetsOnly')
    .addToUi();
}

// -------------------------------------------------------------
// 1-CLICK AUTO SETUP & CLEAN: จัดระเบียบ 8 แท็บมาตรฐาน + ลบส่วนเกิน
// -------------------------------------------------------------
function autoOrganizeCleanSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Rename existing legacy sheets if present
  var renameMap = {
    'Items': '1.Items',
    'Transactions': '2.Transactions',
    'Bookings': '3.Bookings',
    'Purchase_Orders': '4.Purchase_Orders',
    'Users': '5.Users',
    'Audit_Logs': '6.Audit_Logs',
    'Announcements': '7. Announcements',
    '7.Announcements': '7. Announcements',
    '0.ภาพรวม': '0.Dashboard'
  };

  Object.keys(renameMap).forEach(function(oldName) {
    var oldSheet = ss.getSheetByName(oldName);
    var targetName = renameMap[oldName];
    var targetSheet = ss.getSheetByName(targetName);
    if (oldSheet && !targetSheet) {
      try { oldSheet.setName(targetName); } catch(e) {}
    }
  });

  // 2. Define standard table schemas
  var schemas = {
    '1.Items': [
      'code', 'name', 'category', 'qty', 'unit', 'minAlert', 'expiry', 
      'room', 'cabinet', 'shelf', 'damagedQty', 'createdAt'
    ],
    '2.Transactions': [
      'id', 'code', 'itemCode', 'itemName', 'qty', 'unit', 'borrower', 
      'room', 'date', 'slot', 'notes', 'status', 'type', 'timestamp', 'createdAt'
    ],
    '4.Purchase_Orders': [
      'id', 'code', 'name', 'academicYear', 'semester', 
      'unitPrice', 'quantity', 'totalPrice', 'discount', 'date'
    ],
    '5.Users': [
      'id', 'teacherId', 'name', 'department', 'email', 'role', 
      'roleName', 'assignedRooms', 'initials', 'color', 'isActive', 'createdAt'
    ],
    '6.Audit_Logs': [
      'id', 'action', 'details', 'timestamp', 'user'
    ],
    '7. Announcements': [
      'enabled', 'text', 'badgeText', 'speed', 'gap', 
      'theme', 'pauseOnHover', 'emergencyContacts', 'updatedAt'
    ]
  };

  // สร้างหรือตรวจสอบ 6 แท็บมาตรฐานทั่วไป
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

  // 3. จัดระเบียบแท็บ "3.Bookings" (รวมข้อมูลทุกห้องและจัดคอลัมน์ A ถึง J ให้ตรงช่อง 100%)
  setupAndMigrateBookingsSheet(ss);

  // 4. สร้างหรืออัปเดตแท็บ "0.Dashboard" (แดชบอร์ดสรุปสถิติอัตโนมัติ)
  setupDashboardSheet(ss);

  // 5. จัดเรียงลำดับแท็บชีตทั้ง 8 แท็บให้อยู่ในลำดับ 0 ถึง 7
  ALL_VALID_SHEET_NAMES.forEach(function(tabName, index) {
    var s = ss.getSheetByName(tabName);
    if (s) {
      try {
        ss.setActiveSheet(s);
        ss.moveActiveSheet(index + 1);
      } catch(e) {}
    }
  });

  // 6. ลบชีตส่วนเกินอื่นๆ ทั้งหมด ให้เหลือเฉพาะ 8 แท็บมาตรฐาน
  cleanExtraSheetsOnly(ss);

  var dashSheet = ss.getSheetByName(CANONICAL_TABS.DASHBOARD);
  if (dashSheet) ss.setActiveSheet(dashSheet);
  ss.toast('✅ ฐานข้อมูลถูกปรับให้เหลือเฉพาะ 8 แท็บมาตรฐาน (0.Dashboard ถึง 7. Announcements) เรียบร้อยแล้ว!', 'สำเร็จ', 6);
}

// -------------------------------------------------------------
// SETUP 0.DASHBOARD SHEET
// -------------------------------------------------------------
function setupDashboardSheet(ss) {
  var dashSheet = ss.getSheetByName(CANONICAL_TABS.DASHBOARD);
  if (!dashSheet) {
    dashSheet = ss.insertSheet(CANONICAL_TABS.DASHBOARD, 0);
  }

  dashSheet.clear();
  dashSheet.setHiddenGridlines(false);

  // หัวข้อแดชบอร์ด
  dashSheet.getRange('A1:G1').merge()
           .setValue('📊 แดชบอร์ดภาพรวมห้องปฏิบัติการวิทยาศาสตร์ (Laboratory Analytics & Live Overview)')
           .setBackground('#0f172a')
           .setFontColor('#ffffff')
           .setFontSize(13.5)
           .setFontWeight('bold')
           .setHorizontalAlignment('center')
           .setVerticalAlignment('middle');
  dashSheet.setRowHeight(1, 42);

  // คำอธิบาย
  dashSheet.getRange('A2:G2').merge()
           .setValue('อัปเดตข้อมูลอัตโนมัติจากชีต 1.Items, 2.Transactions, 3.Bookings, 4.Purchase_Orders, 5.Users, 6.Audit_Logs, 7. Announcements')
           .setFontSize(9.5)
           .setFontColor('#64748b')
           .setHorizontalAlignment('center');
  dashSheet.setRowHeight(2, 22);

  // กล่องที่ 1: คลังพัสดุและสารเคมี (1.Items)
  dashSheet.getRange('A4:C4').merge().setValue('📦 1. สถิติคลังสารเคมีและอุปกรณ์ (1.Items)').setBackground('#e0f2fe').setFontColor('#0369a1').setFontWeight('bold').setFontSize(10.5);
  dashSheet.getRange('A5').setValue('สารเคมีและอุปกรณ์ทั้งหมด:');
  dashSheet.getRange('C5').setFormula("=IFERROR(COUNTA('1.Items'!A2:A), 0)").setFontWeight('bold').setHorizontalAlignment('right');
  
  dashSheet.getRange('A6').setValue('• สารเคมี:');
  dashSheet.getRange('C6').setFormula("=IFERROR(COUNTIF('1.Items'!C2:C, \"สารเคมี\"), 0)").setHorizontalAlignment('right');
  
  dashSheet.getRange('A7').setValue('• อุปกรณ์ / เครื่องแก้ว:');
  dashSheet.getRange('C7').setFormula("=IFERROR(COUNTIF('1.Items'!C2:C, \"<>สารเคมี\") - COUNTIF('1.Items'!C2:C, \"\"), 0)").setHorizontalAlignment('right');
  
  dashSheet.getRange('A8').setValue('⚠️ รายการสต็อกต่ำกว่าเกณฑ์:');
  dashSheet.getRange('C8').setFormula("=IFERROR(COUNTIF('1.Items'!D2:D, \"<=2\"), 0)").setFontColor('#ea580c').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('A9').setValue('❌ รายการชำรุดสะสม:');
  dashSheet.getRange('C9').setFormula("=IFERROR(SUM('1.Items'!K2:K), 0)").setFontColor('#dc2626').setHorizontalAlignment('right');

  // กล่องที่ 2: การจองห้องปฏิบัติการและยืมคืน (3.Bookings & 2.Transactions)
  dashSheet.getRange('E4:G4').merge().setValue('🔬 2. การจองแล็บและยืมคืน (3.Bookings & 2.Transactions)').setBackground('#f3e8ff').setFontColor('#7e22ce').setFontWeight('bold').setFontSize(10.5);
  dashSheet.getRange('E5').setValue('รายการจองห้องแล็บทั้งหมด:');
  dashSheet.getRange('G5').setFormula("=IFERROR(COUNTA('3.Bookings'!A3:A), 0)").setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E6').setValue('• รออนุมัติการจอง:');
  dashSheet.getRange('G6').setFormula("=IFERROR(COUNTIF('3.Bookings'!I3:I, \"*รออนุมัติ*\") + COUNTIF('3.Bookings'!I3:I, \"*pending*\"), 0)").setFontColor('#ea580c').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E7').setValue('• อนุมัติ / เสร็จสิ้นแล้ว:');
  dashSheet.getRange('G7').setFormula("=IFERROR(COUNTIF('3.Bookings'!I3:I, \"*อนุมัติแล้ว*\") + COUNTIF('3.Bookings'!I3:I, \"*approved*\") + COUNTIF('3.Bookings'!I3:I, \"*เสร็จสิ้น*\"), 0)").setHorizontalAlignment('right');

  dashSheet.getRange('E8').setValue('📋 ประวัติการทำรายการยืม-คืน:');
  dashSheet.getRange('G8').setFormula("=IFERROR(COUNTA('2.Transactions'!A2:A), 0)").setHorizontalAlignment('right');

  dashSheet.getRange('E9').setValue('🔄 กำลังยืมใช้งานอยู่ในขณะนี้:');
  dashSheet.getRange('G9').setFormula("=IFERROR(COUNTIF('2.Transactions'!L2:L, \"กำลังยืม\"), 0)").setFontColor('#2563eb').setFontWeight('bold').setHorizontalAlignment('right');

  // กล่องที่ 3: ผู้ใช้งานและระบบสิทธิ์ (5.Users)
  dashSheet.getRange('A11:C11').merge().setValue('👥 3. ผู้ใช้งานและระบบสิทธิ์ (5.Users)').setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold').setFontSize(10.5);
  dashSheet.getRange('A12').setValue('ผู้ใช้งานทั้งหมดในระบบ:');
  dashSheet.getRange('C12').setFormula("=IFERROR(COUNTA('5.Users'!A2:A), 0)").setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('A13').setValue('• ครูผู้สอน (L1):');
  dashSheet.getRange('C13').setFormula("=IFERROR(COUNTIF('5.Users'!F2:F, \"L1\"), 0)").setHorizontalAlignment('right');

  dashSheet.getRange('A14').setValue('• เจ้าหน้าที่แล็บ (L2):');
  dashSheet.getRange('C14').setFormula("=IFERROR(COUNTIF('5.Users'!F2:F, \"L2\"), 0)").setHorizontalAlignment('right');

  dashSheet.getRange('A15').setValue('• ผู้ดูแลระบบ / ผู้บริหาร (L3-L4):');
  dashSheet.getRange('C15').setFormula("=IFERROR(COUNTIF('5.Users'!F2:F, \"L3\") + COUNTIF('5.Users'!F2:F, \"L4\"), 0)").setHorizontalAlignment('right');

  // กล่องที่ 4: คำสั่งซื้อและงบประมาณ (4.Purchase_Orders)
  dashSheet.getRange('E11:G11').merge().setValue('💰 4. คำสั่งซื้อและงบประมาณ (4.Purchase_Orders)').setBackground('#dcfce7').setFontColor('#166534').setFontWeight('bold').setFontSize(10.5);
  dashSheet.getRange('E12').setValue('จำนวนใบสั่งซื้อทั้งหมด:');
  dashSheet.getRange('G12').setFormula("=IFERROR(COUNTA('4.Purchase_Orders'!A2:A), 0)").setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E13').setValue('ยอดรวมงบประมาณจัดซื้อ:');
  dashSheet.getRange('G13').setFormula("=IFERROR(SUM('4.Purchase_Orders'!G2:G), 0)").setFontWeight('bold').setFontColor('#15803d').setHorizontalAlignment('right');

  // ปรับขนาดและสไตล์ของตารางแดชบอร์ด
  dashSheet.setColumnWidth(1, 230);
  dashSheet.setColumnWidth(2, 20);
  dashSheet.setColumnWidth(3, 100);
  dashSheet.setColumnWidth(4, 30);
  dashSheet.setColumnWidth(5, 230);
  dashSheet.setColumnWidth(6, 20);
  dashSheet.setColumnWidth(7, 100);
}

// -------------------------------------------------------------
// SETUP & MIGRATE BOOKINGS SHEET (3.Bookings)
// -------------------------------------------------------------
function setupAndMigrateBookingsSheet(ss) {
  var sheet = ss.getSheetByName(CANONICAL_TABS.BOOKINGS) || ss.getSheetByName('Bookings');
  if (!sheet) {
    sheet = ss.insertSheet(CANONICAL_TABS.BOOKINGS, 3);
  } else {
    sheet.setName(CANONICAL_TABS.BOOKINGS);
  }

  // 1. อ่านข้อมูลเดิมและถอดรหัสฟิลด์ให้ถูกต้อง
  var lastRow = sheet.getLastRow();
  var extractedBookings = [];

  if (lastRow >= 2) {
    var fullRange = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
    var startIdx = 1;
    if (String(fullRange[0][0]).indexOf('ห้องปฏิบัติการ') !== -1 || String(fullRange[0][0]).indexOf('ภาคเรียน') !== -1) {
      startIdx = 2; // ข้ามแถว title และ header
    }

    for (var i = startIdx; i < fullRange.length; i++) {
      var row = fullRange[i];
      var item = parseAnyBookingRow(row);
      if (item && (item.room || item.date || item.purpose || item.bookerName)) {
        extractedBookings.push(item);
      }
    }
  }

  // 2. เคลียร์ชีตเพื่อสร้างโครงสร้างใหม่
  sheet.clear();
  sheet.setHiddenGridlines(false);

  // Row 1: Merged Title Header
  sheet.getRange('A1:J1').merge()
       .setValue('ห้องปฏิบัติการวิทยาศาสตร์และลงข้อมูลการใช้ห้อง ภาคเรียนที่ 1/2569')
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
    'ห้องปฏิบัติการ',
    'ระบุระดับชั้นของนักเรียนที่เข้าใช้งาน',
    'จำนวนนักเรียนที่เข้าใช้งานทั้งสิ้น',
    'ระบุกิจกรรมที่ใช้ (เช่น ทำ Lab เรื่อง..................../ การเรียนการสอนเรื่อง......./กิจกรรมชมรม เป็นต้น)',
    'ลงชื่อคุณครู (พิมพ์เฉพาะชื่อเท่านั้น)',
    'สถานะ',
    'id'
  ];

  sheet.getRange(2, 1, 1, 10)
       .setValues([headers])
       .setBackground('#f8fafc')
       .setFontColor('#1e293b')
       .setFontWeight('bold')
       .setFontSize(9)
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle')
       .setWrap(true);
  sheet.setRowHeight(2, 42);

  sheet.setColumnWidth(1, 50);  // ลำดับ
  sheet.setColumnWidth(2, 120); // วัน/เดือน/ปี
  sheet.setColumnWidth(3, 110); // เวลา
  sheet.setColumnWidth(4, 210); // ห้องแล็บ
  sheet.setColumnWidth(5, 140); // ระดับชั้น
  sheet.setColumnWidth(6, 120); // จำนวนนักเรียน
  sheet.setColumnWidth(7, 360); // กิจกรรม
  sheet.setColumnWidth(8, 160); // ครู
  sheet.setColumnWidth(9, 100); // สถานะ
  sheet.setColumnWidth(10, 140); // id

  sheet.setFrozenRows(2);

  // 3. เขียนข้อมูลกลับลงชีตอย่างแม่นยำ
  if (extractedBookings.length > 0) {
    var rowsToWrite = extractedBookings.map(function(b, idx) {
      return [
        idx + 1,
        b.date,
        b.slot,
        b.room,
        b.gradeLevel,
        b.studentCount,
        b.purpose,
        b.bookerName,
        b.status,
        b.id
      ];
    });

    var dataRange = sheet.getRange(3, 1, rowsToWrite.length, 10);
    dataRange.setValues(rowsToWrite)
             .setFontSize(9)
             .setVerticalAlignment('middle')
             .setWrap(true);

    sheet.getRange(3, 1, rowsToWrite.length, 1).setHorizontalAlignment('center').setFontWeight('bold');
    sheet.getRange(3, 2, rowsToWrite.length, 1).setHorizontalAlignment('center');
    sheet.getRange(3, 3, rowsToWrite.length, 1).setHorizontalAlignment('center');
    sheet.getRange(3, 4, rowsToWrite.length, 1).setHorizontalAlignment('left');
    sheet.getRange(3, 5, rowsToWrite.length, 1).setHorizontalAlignment('center');
    sheet.getRange(3, 6, rowsToWrite.length, 1).setHorizontalAlignment('center');
    sheet.getRange(3, 7, rowsToWrite.length, 1).setHorizontalAlignment('left');
    sheet.getRange(3, 8, rowsToWrite.length, 1).setHorizontalAlignment('center');
    sheet.getRange(3, 9, rowsToWrite.length, 1).setHorizontalAlignment('center');
    sheet.getRange(3, 10, rowsToWrite.length, 1).setHorizontalAlignment('center').setFontColor('#64748b');

    dataRange.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  }

  try {
    var filter = sheet.getFilter();
    if (!filter) {
      sheet.getRange(2, 1, Math.max(sheet.getLastRow(), 3), 10).createFilter();
    }
  } catch(e) {}
}

// -------------------------------------------------------------
// HELPER: CLEAN ALL EXTRA SHEETS OUTSIDE 8 CANONICAL TABS
// -------------------------------------------------------------
function cleanExtraSheetsOnly(ss) {
  if (!ss) ss = SpreadsheetApp.getActiveSpreadsheet();
  var allSheets = ss.getSheets();
  allSheets.forEach(function(s) {
    var name = s.getName();
    if (ALL_VALID_SHEET_NAMES.indexOf(name) === -1 && allSheets.length > 1) {
      try { ss.deleteSheet(s); } catch(e) {}
    }
  });
}

// -------------------------------------------------------------
// HELPER: PARSE & RECOVER ANY ROW INTO CLEAN BOOKING OBJECT
// -------------------------------------------------------------
function parseAnyBookingRow(row) {
  var id = "";
  var room = "";
  var date = "";
  var slot = "";
  var gradeLevel = "-";
  var studentCount = "-";
  var purpose = "";
  var bookerName = "";
  var status = "อนุมัติแล้ว";

  var roomMap = {
    'Lab 1': 'ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ',
    'Lab 2': 'ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์',
    'Lab 3': 'ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์',
    'Lab 4': 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารราฟาเอล',
    'Lab 5': 'ห้องศูนย์ สสวท. (วิทยาศาสตร์) อาคารราฟาเอล',
    'Lab 6': 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารอัสสัมชัญ',
    'Lab 7': 'ห้องศูนย์ STEM CENTER',
    'Lab 8': 'ห้องปฏิบัติการวิทยาศาสตร์ (EP) อาคารยอห์น แมรี่'
  };

  row.forEach(function(cell, colIndex) {
    if (cell === null || cell === undefined) return;
    var s = String(cell).trim();
    if (!s) return;

    if (colIndex === 0 && /^\d+$/.test(s)) return;

    if (/^(book_|test_booking_)/i.test(s)) {
      id = s;
    } else if (/^(Lab\s*\d|ห้องปฏิบัติการ|ห้องศูนย์)/i.test(s)) {
      room = roomMap[s] || s;
    } else if (typeof cell === 'string' && s.indexOf('T') !== -1 && s.indexOf('Z') !== -1) {
      if (!id) id = "book_" + s.replace(/[^0-9]/g, "").slice(0, 14);
    } else if (/^\d{4}-\d{2}-\d{2}/.test(s) || (cell instanceof Date)) {
      date = formatDateForLog(cell);
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) {
      date = s;
    } else if (/^(approved|pending|rejected|อนุมัติแล้ว|รออนุมัติ|ปฏิเสธ)$/i.test(s)) {
      if (s.toLowerCase() === 'approved' || s === 'อนุมัติแล้ว') status = 'อนุมัติแล้ว';
      else if (s.toLowerCase() === 'pending' || s === 'รออนุมัติ') status = 'รออนุมัติ';
      else status = 'ปฏิเสธ';
    } else if (/^\[.*\]$/.test(s)) {
      // Skip prepItems JSON array
    } else if (/^(ม\.\d\/\d|ม\.ต้น|ม\.ปลาย|ชมรม|โครงงาน|ม\.\d)/i.test(s)) {
      gradeLevel = s;
    } else if (/^\d+\s*คน$/.test(s) || (/^\d+$/.test(s) && Number(s) > 10 && Number(s) <= 150)) {
      studentCount = s.indexOf('คน') !== -1 ? s : (s + ' คน');
    } else if (/^[1-9](?:\s*,\s*[1-9])*$/.test(s)) {
      if (!slot) slot = "คาบ " + s;
    } else if (/คาบ\s*\d|^\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}/.test(s)) {
      slot = formatSlotForLog(s);
    } else if (/^(\d+(?:[,\s]+\d+)*)\s+(.*)$/.test(s)) {
      var match = s.match(/^(\d+(?:[,\s]+\d+)*)\s+(.*)$/);
      if (!slot) slot = "คาบ " + match[1];
      if (!bookerName) bookerName = match[2];
    } else if (/^(นาย|นางสาว|นาง|น\.ส\.|ครู|อาจารย์|อ\.|ม\.|มิส|ดร\.|Wongsakorn|Aj\.|T\.)/i.test(s)) {
      bookerName = s;
    } else {
      if (!purpose && isNaN(Number(s))) {
        purpose = s;
      }
    }
  });

  if (!id) id = "book_" + Math.random().toString(36).substr(2, 9);
  return {
    id: id,
    room: room || 'ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ',
    date: date || '',
    slot: slot || '-',
    gradeLevel: gradeLevel,
    studentCount: studentCount,
    purpose: purpose || '-',
    bookerName: bookerName || '-',
    status: status
  };
}

// -------------------------------------------------------------
// SORT & FILTER FUNCTIONS
// -------------------------------------------------------------
function sortByRoom() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CANONICAL_TABS.BOOKINGS);
  if (!sheet || sheet.getLastRow() < 3) return;

  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(3, 1, lastRow - 2, 10);
  range.sort([
    { column: 4, ascending: true },
    { column: 2, ascending: true },
    { column: 3, ascending: true }
  ]);

  renumberBookingRows();
  ss.toast('🏢 เรียงลำดับตาม "ห้องปฏิบัติการ" สำเร็จเรียบร้อย!', 'สำเร็จ', 3);
}

function sortByDateTime() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CANONICAL_TABS.BOOKINGS);
  if (!sheet || sheet.getLastRow() < 3) return;

  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(3, 1, lastRow - 2, 10);
  range.sort([
    { column: 2, ascending: true },
    { column: 3, ascending: true }
  ]);

  renumberBookingRows();
  ss.toast('📅 เรียงลำดับตาม "วันที่และเวลาเข้าใช้งาน" สำเร็จเรียบร้อย!', 'สำเร็จ', 3);
}

function sortByTeacher() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CANONICAL_TABS.BOOKINGS);
  if (!sheet || sheet.getLastRow() < 3) return;

  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(3, 1, lastRow - 2, 10);
  range.sort([
    { column: 8, ascending: true },
    { column: 2, ascending: true }
  ]);

  renumberBookingRows();
  ss.toast('👨‍🏫 เรียงลำดับตาม "ชื่อคุณครูผู้สอน" สำเร็จเรียบร้อย!', 'สำเร็จ', 3);
}

function renumberBookingRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CANONICAL_TABS.BOOKINGS);
  if (!sheet || sheet.getLastRow() < 3) return;

  var numRows = sheet.getLastRow() - 2;
  var numbers = [];
  for (var i = 1; i <= numRows; i++) {
    numbers.push([i]);
  }

  var numRange = sheet.getRange(3, 1, numRows, 1);
  numRange.setValues(numbers)
          .setHorizontalAlignment('center')
          .setFontWeight('bold')
          .setFontSize(9);

  sheet.getRange(3, 1, numRows, 10)
       .setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID)
       .setVerticalAlignment('middle')
       .setWrap(true);
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
    var action = (payload.action || '').toUpperCase(); // 'UPSERT', 'DELETE', 'GET_DATA', 'FETCH', 'PING'
    var rawTable = payload.table;
    var table = resolveSheetName(rawTable) || rawTable;
    var data = payload.data;
    var keyField = payload.keyField || 'id';

    if (action === 'PING') {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Active" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'GET_DATA' || action === 'FETCH' || action === 'READ') {
      var sheet = ss.getSheetByName(table);
      if (!sheet) {
        return ContentService.createTextOutput(JSON.stringify({ 
          status: "error", 
          message: "Table " + table + " not found" 
        })).setMimeType(ContentService.MimeType.JSON);
      }
      var sheetData = extractSheetData(sheet, table);
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        data: sheetData 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (!table || !data) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Missing table or data" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var sheet = getOrCreateCanonicalSheet(ss, table);

    var result = "";
    if (action === 'REPLACE_ALL' || action === 'CLEAR_AND_SET') {
      if (Array.isArray(data)) {
        var lastRow = sheet.getLastRow();
        var lastCol = sheet.getLastColumn();
        if (lastRow > 1 && lastCol > 0) {
          sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
        }
        var headers = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
        if (headers.length === 0 && data.length > 0) {
          headers = Object.keys(data[0]);
          sheet.appendRow(headers);
        }
        if (data.length > 0) {
          var rows = data.map(function(item) {
            return headers.map(function(h) {
              var v = item[h];
              return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : (v !== undefined ? v : "");
            });
          });
          sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
        }
        return ContentService.createTextOutput(JSON.stringify({ 
          status: "success", 
          result: "replaced_" + data.length + "_rows",
          table: table
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (table === CANONICAL_TABS.BOOKINGS || table === 'Bookings') {
      result = (action === 'DELETE') ? deleteBookingRow(sheet, data) : upsertBookingRow(sheet, data);
      renumberBookingRows();
    } else {
      result = (action === 'DELETE') ? deleteRow(sheet, data, keyField) : upsertRow(sheet, data, keyField);
    }

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      result: result,
      table: table
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var rawTable = (e && e.parameter && e.parameter.table) ? e.parameter.table : '';
    
    if (!rawTable) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "active", 
        message: "Chemical Lab Realtime Backup & Academic Logbook Webhook is running (8 Canonical Sheets)." 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var table = resolveSheetName(rawTable) || rawTable;
    var sheet = ss.getSheetByName(table);
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: "Table " + table + " not found" 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var results = extractSheetData(sheet, table);

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      table: table,
      data: results 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: err.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// -------------------------------------------------------------
// EXTRACT TABLE DATA
// -------------------------------------------------------------
function extractSheetData(sheet, table) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];

  var rawData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  var results = [];

  if (table === CANONICAL_TABS.BOOKINGS || table === '3.Bookings' || table === 'Bookings') {
    var reverseRoomMap = {
      'ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ': 'Lab 1',
      'ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์': 'Lab 2',
      'ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์': 'Lab 3',
      'ห้องปฏิบัติการวิทยาศาสตร์ อาคารราฟาเอล': 'Lab 4',
      'ห้องศูนย์ สสวท. (วิทยาศาสตร์) อาคารราฟาเอล': 'Lab 5',
      'ห้องปฏิบัติการวิทยาศาสตร์ อาคารอัสสัมชัญ': 'Lab 6',
      'ห้องศูนย์ STEM CENTER': 'Lab 7',
      'ห้องปฏิบัติการวิทยาศาสตร์ (EP) อาคารยอห์น แมรี่': 'Lab 8'
    };

    var startRowIdx = 1;
    if (String(rawData[0][0]).indexOf('ห้องปฏิบัติการ') !== -1 || String(rawData[0][0]).indexOf('ภาคเรียน') !== -1) {
      startRowIdx = 2;
    }

    for (var i = startRowIdx; i < rawData.length; i++) {
      var row = rawData[i];
      var parsed = parseAnyBookingRow(row);
      if (parsed && (parsed.id || parsed.room || parsed.date || parsed.purpose)) {
        var cleanRoom = reverseRoomMap[parsed.room] || parsed.room;
        var cleanStatus = (parsed.status === 'อนุมัติแล้ว' || parsed.status === 'approved') ? 'approved' : (parsed.status === 'รออนุมัติ' || parsed.status === 'pending' ? 'pending' : 'rejected');
        results.push({
          id: parsed.id || ("bk_sheet_" + (i + 1)),
          room: cleanRoom,
          roomFullName: parsed.room,
          date: parsed.date,
          slot: parsed.slot,
          gradeLevel: parsed.gradeLevel,
          studentCount: parsed.studentCount,
          purpose: parsed.purpose,
          bookerName: parsed.bookerName,
          teacherName: parsed.bookerName,
          status: cleanStatus,
          createdAt: new Date().toISOString()
        });
      }
    }
    return results;
  }

  var headers = rawData[0];
  for (var i = 1; i < rawData.length; i++) {
    var row = rawData[i];
    var obj = {};
    var hasVal = false;
    for (var j = 0; j < headers.length; j++) {
      var key = String(headers[j]).trim();
      if (key) {
        var val = row[j];
        if (val instanceof Date) {
          val = val.toISOString();
        } else if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try { val = JSON.parse(val); } catch(e) {}
        }
        obj[key] = (val !== undefined && val !== null) ? val : "";
        if (val !== "" && val !== null && val !== undefined) hasVal = true;
      }
    }
    if (hasVal) {
      results.push(obj);
    }
  }
  return results;
}

// -------------------------------------------------------------
// BOOKINGS UPSERT & DELETE (3.Bookings)
// -------------------------------------------------------------
function upsertBookingRow(sheet, data) {
  var id = data.id || '';
  if (!id) return "missing_id";

  var roomMap = {
    'Lab 1': 'ห้องปฏิบัติการเคมี อาคารอัสสัมชัญ',
    'Lab 2': 'ห้องปฏิบัติการฟิสิกส์ อาคารเซนต์ปีเตอร์',
    'Lab 3': 'ห้องปฏิบัติการชีววิทยา อาคารเซนต์ปีเตอร์',
    'Lab 4': 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารราฟาเอล',
    'Lab 5': 'ห้องศูนย์ สสวท. (วิทยาศาสตร์) อาคารราฟาเอล',
    'Lab 6': 'ห้องปฏิบัติการวิทยาศาสตร์ อาคารอัสสัมชัญ',
    'Lab 7': 'ห้องศูนย์ STEM CENTER',
    'Lab 8': 'ห้องปฏิบัติการวิทยาศาสตร์ (EP) อาคารยอห์น แมรี่'
  };

  var rawRoom = data.room || data['ห้องปฏิบัติการ'] || '';
  var roomVal = roomMap[rawRoom] || rawRoom;
  var dateVal = formatDateForLog(data.date || data['วัน/เดือน/ปี ที่ใช้งาน']);
  var slotVal = formatSlotForLog(data.slot || data['เวลาที่เข้าใช้']);
  var gradeVal = data.gradeLevel || data['ระบุระดับชั้นของนักเรียนที่เข้าใช้งาน'] || '-';
  var countVal = data.studentCount || data['จำนวนนักเรียนที่เข้าใช้งานทั้งหมด'] || data['จำนวนนักเรียนที่เข้าใช้งานทั้งสิ้น'] || '-';
  if (countVal !== '-' && String(countVal).indexOf('คน') === -1) countVal = countVal + ' คน';
  var purposeVal = data.purpose || data.activity || data['ระบุกิจกรรมที่ใช้ (เช่น ทำ Lab เรื่อง............../การเรียนการสอนเรื่อง....../กิจกรรมชมรม เป็นต้น)'] || data['ระบุกิจกรรมที่ใช้ (เช่น ทำ Lab เรื่อง..................../ การเรียนการสอนเรื่อง......./กิจกรรมชมรม เป็นต้น)'] || '';
  var bookerVal = data.bookerName || data.teacherName || data['ลงชื่อคุณครู (พิมพ์เฉพาะชื่อเท่านั้น)'] || '';
  var rawStatus = data.status || data['สถานะ'] || 'อนุมัติแล้ว';
  var statusVal = (rawStatus === 'approved' || rawStatus === 'อนุมัติแล้ว') ? 'อนุมัติแล้ว' : (rawStatus === 'pending' || rawStatus === 'รออนุมัติ' ? 'รออนุมัติ' : 'ปฏิเสธ');

  var rowValues = [
    "", // Col 1 (A): ลำดับ
    dateVal, // Col 2 (B): วัน/เดือน/ปี ที่ใช้งาน
    slotVal, // Col 3 (C): เวลาที่เข้าใช้
    roomVal, // Col 4 (D): ห้องปฏิบัติการ
    gradeVal, // Col 5 (E): ระบุระดับชั้น
    countVal, // Col 6 (F): จำนวนนักเรียน
    purposeVal, // Col 7 (G): ระบุกิจกรรม
    bookerVal, // Col 8 (H): ลงชื่อคุณครู
    statusVal, // Col 9 (I): สถานะ
    id // Col 10 (J): id
  ];

  var lastRow = sheet.getLastRow();
  if (lastRow >= 3) {
    var idColRange = sheet.getRange(3, 10, lastRow - 2, 1).getValues();
    for (var i = 0; i < idColRange.length; i++) {
      if (String(idColRange[i][0]).trim() === String(id).trim()) {
        rowValues[0] = i + 1;
        sheet.getRange(i + 3, 1, 1, 10).setValues([rowValues]);
        return "updated_row_" + (i + 3);
      }
    }
  }

  rowValues[0] = Math.max(lastRow - 1, 1);
  sheet.appendRow(rowValues);
  return "inserted_new_booking";
}

function deleteBookingRow(sheet, data) {
  var id = data.id || '';
  var lastRow = sheet.getLastRow();
  if (lastRow < 3 || !id) return "not_found";

  var idColRange = sheet.getRange(3, 10, lastRow - 2, 1).getValues();
  for (var i = idColRange.length - 1; i >= 0; i--) {
    if (String(idColRange[i][0]).trim() === String(id).trim()) {
      sheet.deleteRow(i + 3);
      return "deleted_row_" + (i + 3);
    }
  }
  return "row_not_found";
}

// -------------------------------------------------------------
// STANDARD GENERIC TABLES UPSERT / DELETE
// -------------------------------------------------------------
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
  if (s.indexOf('(') !== -1 && s.indexOf(')') !== -1) {
    var m = s.match(/\(([^)]+)\)/);
    if (m) return m[1].replace(/:/g, '.');
  }
  return s.replace(/:/g, '.');
}
