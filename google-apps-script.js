/**
 * Chemical Laboratory Management System - Google Sheets Realtime Backup & Academic Logbook
 * ==============================================================================
 * วิธีใช้งาน:
 * 1. เปิด Google Sheet ที่ต้องการใช้งาน
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดใน Code.gs แล้วนำโค้ดด้านล่างนี้ไปวางแทนที่ทั้งหมด
 * 4. ด้านบนเลือกฟังก์ชัน "autoOrganizeCleanSheets" แล้วกดปุ่ม Run (▶️)
 *    - ระบบจะลบแท็บห้องแล็บแยกเดิมทิ้งทั้งหมด
 *    - รวมข้อมูลการจองทุกห้องเข้าแท็บ "Bookings" เดียวในรูปแบบสมุดบันทึก พร้อมจัดคอลัมน์ถูกต้อง 100%
 * 5. กด Deploy (การทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้รายการใหม่)
 *    - Type: Web app
 *    - Execute as: Me (ฉัน)
 *    - Who has access: Anyone (ทุกคน)
 * ==============================================================================
 */

// -------------------------------------------------------------
// CUSTOM MENU IN GOOGLE SHEETS (พร้อมปุ่ม SORT / FILTER)
// -------------------------------------------------------------
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔬 เมนูระบบห้องแล็บ')
    .addItem('📊 จัดระเบียบชีต & แก้ไขข้อมูลลงช่อง (Auto Organize)', 'autoOrganizeCleanSheets')
    .addSeparator()
    .addItem('🏢 เรียงตาม: ห้องปฏิบัติการ (Sort by Room)', 'sortByRoom')
    .addItem('📅 เรียงตาม: วันที่และเวลาใช้งาน (Sort by Date & Time)', 'sortByDateTime')
    .addItem('👨‍🏫 เรียงตาม: ชื่อคุณครูผู้สอน (Sort by Teacher)', 'sortByTeacher')
    .addSeparator()
    .addItem('🔄 รีเฟรชลำดับตัวเลข 1, 2, 3... (Re-number Rows)', 'renumberBookingRows')
    .addToUi();
}

// -------------------------------------------------------------
// 1-CLICK AUTO SETUP: ลบแท็บแยกห้องทิ้ง + จัดระเบียบ 8 แท็บมาตรฐาน
// -------------------------------------------------------------
function autoOrganizeCleanSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. โครงสร้าง 6 แท็บมาตรฐานทั่วไป
  var schemas = {
    'Items': [
      'code', 'name', 'category', 'qty', 'unit', 'minAlert', 'expiry', 
      'room', 'cabinet', 'shelf', 'damagedQty', 'createdAt'
    ],
    'Transactions': [
      'id', 'code', 'itemCode', 'itemName', 'qty', 'unit', 'borrower', 
      'room', 'date', 'slot', 'notes', 'status', 'type', 'timestamp', 'createdAt'
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

  // สร้างหรือตรวจสอบ 6 แท็บมาตรฐาน
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

  // 2. จัดระเบียบแท็บ "Bookings" (รวมทุกห้องในแท็บเดียว และวางข้อมูลตรงช่อง 100%)
  setupAndMigrateBookingsSheet(ss);

  // 3. สร้างแท็บ "0.Dashboard" (ภาพรวมแดชบอร์ดสรุปสถิติอัตโนมัติ)
  var dashSheet = ss.getSheetByName('0.Dashboard') || ss.getSheetByName('0.ภาพรวม');
  if (!dashSheet) {
    dashSheet = ss.insertSheet('0.Dashboard', 0);
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
  dashSheet.getRange('G5').setFormula('=IFERROR(COUNTA(Bookings!A3:A), 0)').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E6').setValue('• รออนุมัติการจอง:');
  dashSheet.getRange('G6').setFormula('=IFERROR(COUNTIF(Bookings!I3:I, "*รออนุมัติ*") + COUNTIF(Bookings!I3:I, "*pending*"), 0)').setFontColor('#ea580c').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E7').setValue('• อนุมัติ / เสร็จสิ้นแล้ว:');
  dashSheet.getRange('G7').setFormula('=IFERROR(COUNTIF(Bookings!I3:I, "*อนุมัติแล้ว*") + COUNTIF(Bookings!I3:I, "*approved*") + COUNTIF(Bookings!I3:I, "*เสร็จสิ้น*"), 0)').setHorizontalAlignment('right');

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

  // ปรับความกว้างคอลัมน์แดชบอร์ด
  dashSheet.setColumnWidth(1, 220);
  dashSheet.setColumnWidth(2, 20);
  dashSheet.setColumnWidth(3, 100);
  dashSheet.setColumnWidth(4, 30);
  dashSheet.setColumnWidth(5, 220);
  dashSheet.setColumnWidth(6, 20);
  dashSheet.setColumnWidth(7, 100);

  // 4. ลบแท็บแยกห้องแล็บเดิมทิ้งทั้งหมด ให้เหลือเฉพาะ 8 แท็บมาตรฐาน
  var standardTabs = ['0.Dashboard', '0.ภาพรวม', 'Items', 'Transactions', 'Bookings', 'Purchase_Orders', 'Users', 'Audit_Logs', 'Announcements'];
  var allSheets = ss.getSheets();
  allSheets.forEach(function(s) {
    var name = s.getName();
    if (standardTabs.indexOf(name) === -1 && allSheets.length > 1) {
      try { ss.deleteSheet(s); } catch(e) {}
    }
  });

  ss.setActiveSheet(dashSheet);
  ss.toast('✅ ลบแท็บแยกห้องแล็บเดิมทิ้ง และจัดระเบียบข้อมูลลงช่องถูกต้องเรียบร้อย!', 'สำเร็จ', 5);
}

// -------------------------------------------------------------
// SETUP & MIGRATE BOOKINGS SHEET (จัดคอลัมน์ให้ตรงช่อง 100%)
// -------------------------------------------------------------
function setupAndMigrateBookingsSheet(ss) {
  var sheet = ss.getSheetByName('Bookings');
  if (!sheet) {
    sheet = ss.insertSheet('Bookings', 3);
  }

  // 1. อ่านข้อมูลเดิมและวิเคราะห์ถอดรหัสฟิลด์ให้ถูกต้อง
  var lastRow = sheet.getLastRow();
  var extractedBookings = [];

  if (lastRow >= 2) {
    var fullRange = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
    
    // เริ่มอ่านจากแถวที่ 2 หรือ 3
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

  // 2. เคลียร์ชีตเพื่อสร้างโครงสร้างใหม่ที่สมบูรณ์
  sheet.clear();
  sheet.setHiddenGridlines(false);

  // Row 1: Merged Title Header
  sheet.getRange('A1:J1').merge()
       .setValue('ห้องปฏิบัติการวิทยาศาสตร์และลงข้อมูลการใช้ห้อง ภาคเรียนที่ 1/2569')
       .setBackground('#a7f3d0') // Soft Mint Green Header (ตามแบบภาพ)
       .setFontColor('#064e3b')
       .setFontWeight('bold')
       .setFontSize(11.5)
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
       .setFontSize(9.5)
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle')
       .setWrap(true);
  sheet.setRowHeight(2, 44);

  // กำหนดความกว้างคอลัมน์
  sheet.setColumnWidth(1, 55);  // ลำดับ
  sheet.setColumnWidth(2, 120); // วัน/เดือน/ปี ที่ใช้งาน
  sheet.setColumnWidth(3, 110); // เวลาที่เข้าใช้
  sheet.setColumnWidth(4, 210); // ห้องปฏิบัติการ
  sheet.setColumnWidth(5, 140); // ระบุระดับชั้น
  sheet.setColumnWidth(6, 120); // จำนวนนักเรียน
  sheet.setColumnWidth(7, 360); // ระบุกิจกรรมที่ใช้
  sheet.setColumnWidth(8, 160); // ลงชื่อคุณครู
  sheet.setColumnWidth(9, 100); // สถานะ
  sheet.setColumnWidth(10, 140); // id

  sheet.setFrozenRows(2);

  // 3. เขียนข้อมูลกลับลงชีตอย่างแม่นยำในตำแหน่งคอลัมน์ A ถึง J
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
             .setFontSize(9.5)
             .setVerticalAlignment('middle')
             .setWrap(true);

    // ปรับการจัดแนวข้อความ (Alignment)
    sheet.getRange(3, 1, rowsToWrite.length, 1).setHorizontalAlignment('center').setFontWeight('bold'); // ลำดับ
    sheet.getRange(3, 2, rowsToWrite.length, 1).setHorizontalAlignment('center'); // วันที่
    sheet.getRange(3, 3, rowsToWrite.length, 1).setHorizontalAlignment('center'); // เวลา
    sheet.getRange(3, 4, rowsToWrite.length, 1).setHorizontalAlignment('left');   // ห้องแล็บ
    sheet.getRange(3, 5, rowsToWrite.length, 1).setHorizontalAlignment('center'); // ชั้น
    sheet.getRange(3, 6, rowsToWrite.length, 1).setHorizontalAlignment('center'); // จำนวน
    sheet.getRange(3, 7, rowsToWrite.length, 1).setHorizontalAlignment('left');   // กิจกรรม
    sheet.getRange(3, 8, rowsToWrite.length, 1).setHorizontalAlignment('center'); // ครู
    sheet.getRange(3, 9, rowsToWrite.length, 1).setHorizontalAlignment('center'); // สถานะ
    sheet.getRange(3, 10, rowsToWrite.length, 1).setHorizontalAlignment('center').setFontColor('#64748b'); // id

    dataRange.setBorder(true, true, true, true, true, true, '#cbd5e1', SpreadsheetApp.BorderStyle.SOLID);
  }

  // สร้างปุ่ม Filter ใน Google Sheet
  try {
    var filter = sheet.getFilter();
    if (!filter) {
      sheet.getRange(2, 1, Math.max(sheet.getLastRow(), 3), 10).createFilter();
    }
  } catch(e) {}
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

    // Skip sequence number in column A (1, 2, 3, ...)
    if (colIndex === 0 && /^\d+$/.test(s)) return;

    // Detect ID
    if (/^(book_|test_booking_)/i.test(s)) {
      id = s;
    }
    // Detect Room
    else if (/^(Lab\s*\d|ห้องปฏิบัติการ|ห้องศูนย์)/i.test(s)) {
      room = roomMap[s] || s;
    }
    // Detect ISO Timestamp string ending with Z (createdAt / fallback ID)
    else if (typeof cell === 'string' && s.indexOf('T') !== -1 && s.indexOf('Z') !== -1) {
      if (!id) id = "book_" + s.replace(/[^0-9]/g, "").slice(0, 14);
    }
    // Detect Date
    else if (/^\d{4}-\d{2}-\d{2}/.test(s) || (cell instanceof Date)) {
      date = formatDateForLog(cell);
    }
    else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) {
      date = s;
    }
    // Detect Status
    else if (/^(approved|pending|rejected|อนุมัติแล้ว|รออนุมัติ|ปฏิเสธ)$/i.test(s)) {
      if (s.toLowerCase() === 'approved' || s === 'อนุมัติแล้ว') status = 'อนุมัติแล้ว';
      else if (s.toLowerCase() === 'pending' || s === 'รออนุมัติ') status = 'รออนุมัติ';
      else status = 'ปฏิเสธ';
    }
    // Detect prepItems JSON (skip)
    else if (/^\[.*\]$/.test(s)) {
      // JSON prep items array e.g. [{"qty":...}] or [], skip
    }
    // Detect Grade level
    else if (/^(ม\.\d\/\d|ม\.ต้น|ม\.ปลาย|ชมรม|โครงงาน|ม\.\d)/i.test(s)) {
      gradeLevel = s;
    }
    // Detect Student Count
    else if (/^\d+\s*คน$/.test(s) || (/^\d+$/.test(s) && Number(s) > 10 && Number(s) <= 150)) {
      studentCount = s.indexOf('คน') !== -1 ? s : (s + ' คน');
    }
    // Detect Periods e.g. "3", "4, 5", "1, 2", "5, 6", "7, 8"
    else if (/^[1-9](?:\s*,\s*[1-9])*$/.test(s)) {
      if (!slot) slot = "คาบ " + s;
    }
    // Detect Time Slot / Period strings e.g. "คาบ 6: 13:20 - 14:10, คาบ 7: 14:10 - 15:00"
    else if (/คาบ\s*\d|^\d{1,2}[:.]\d{2}\s*-\s*\d{1,2}[:.]\d{2}/.test(s)) {
      slot = formatSlotForLog(s);
    }
    // Detect combined slot & name e.g. "3 นายสมชาย เรียนดี"
    else if (/^(\d+(?:[,\s]+\d+)*)\s+(.*)$/.test(s)) {
      var match = s.match(/^(\d+(?:[,\s]+\d+)*)\s+(.*)$/);
      if (!slot) slot = "คาบ " + match[1];
      if (!bookerName) bookerName = match[2];
    }
    // Detect Teacher / Booker Name
    else if (/^(นาย|นางสาว|นาง|น\.ส\.|ครู|อาจารย์|อ\.|ม\.|มิส|ดร\.|Wongsakorn|Aj\.|T\.)/i.test(s)) {
      bookerName = s;
    }
    // Otherwise Purpose / Activity
    else {
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

// 1. เรียงตาม ห้องปฏิบัติการ และ วันที่
function sortByRoom() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Bookings');
  if (!sheet || sheet.getLastRow() < 3) return;

  var lastRow = sheet.getLastRow();
  // Sort Col D (Room) Ascending, then Col B (Date) Ascending
  var range = sheet.getRange(3, 1, lastRow - 2, 10);
  range.sort([
    { column: 4, ascending: true },
    { column: 2, ascending: true },
    { column: 3, ascending: true }
  ]);

  renumberBookingRows();
  ss.toast('🏢 เรียงลำดับตาม "ห้องปฏิบัติการ" สำเร็จเรียบร้อย!', 'สำเร็จ', 3);
}

// 2. เรียงตาม วันที่ และ เวลาเข้าใช้
function sortByDateTime() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Bookings');
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

// 3. เรียงตาม ชื่อคุณครูผู้สอน
function sortByTeacher() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Bookings');
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

// 4. รันลำดับตัวเลข 1, 2, 3... ในคอลัมน์ A ให้อัตโนมัติ
function renumberBookingRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Bookings');
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
          .setFontSize(9.5);

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

    var result = "";
    if (table === 'Bookings') {
      result = (action === 'DELETE') ? deleteBookingRow(sheet, data) : upsertBookingRow(sheet, data);
      renumberBookingRows();
    } else {
      result = (action === 'DELETE') ? deleteRow(sheet, data, keyField) : upsertRow(sheet, data, keyField);
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
    message: "Chemical Lab Realtime Backup & Academic Logbook Webhook is running." 
  })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// BOOKINGS UPSERT & DELETE (จัดตำแหน่งคอลัมน์ A ถึง J ลงช่อง 100%)
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

  // Append new row
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
