/**
 * Chemical Laboratory Management System - Google Sheets Realtime Backup & Sync
 * ==============================================================================
 * วิธีใช้งาน:
 * 1. เปิด Google Sheet ที่ต้องการสำรองข้อมูล
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดใน Code.gs แล้วนำโค้ดด้านล่างนี้ไปวางแทนที่ทั้งหมด
 * 4. ด้านบนเลือกฟังก์ชัน "autoOrganizeCleanSheets" แล้วกดปุ่ม Run (▶️) เพื่อสร้าง 0.Dashboard + 7 แท็บมาตรฐาน
 * 5. กด Deploy (การทำให้ใช้งานได้) > New deployment (การทำให้ใช้งานได้รายการใหม่)
 *    - Type: Web app
 *    - Execute as: Me (ฉัน)
 *    - Who has access: Anyone (ทุกคน)
 * ==============================================================================
 */

// -------------------------------------------------------------
// 1-CLICK AUTO SETUP & DASHBOARD CREATOR (0.Dashboard + 7 Tabs)
// -------------------------------------------------------------
function autoOrganizeCleanSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. โครงสร้าง 7 แท็บมาตรฐานภาษาอังกฤษ
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
      'id', 'room', 'date', 'slot', 'bookerName', 'purpose', 
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
  dashSheet.getRange('G6').setFormula('=IFERROR(COUNTIF(Bookings!H2:H, "รออนุมัติ"), 0)').setFontColor('#ea580c').setFontWeight('bold').setHorizontalAlignment('right');

  dashSheet.getRange('E7').setValue('• อนุมัติ / เสร็จสิ้นแล้ว:');
  dashSheet.getRange('G7').setFormula('=IFERROR(COUNTIF(Bookings!H2:H, "อนุมัติแล้ว") + COUNTIF(Bookings!H2:H, "เสร็จสิ้น"), 0)').setHorizontalAlignment('right');

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

  // ลบแท็บซ้ำซ้อนเดิม
  var oldTabs = ['Sheet1', 'ชีต1', 'System', 'การจองห้องแล็บ', 'รายการอุปกรณ์', 'รายการสารเคมี'];
  oldTabs.forEach(function(t) {
    var s = ss.getSheetByName(t);
    if (s && ss.getSheets().length > 1) {
      try { ss.deleteSheet(s); } catch(e) {}
    }
  });

  ss.setActiveSheet(dashSheet);
  ss.toast('✅ สร้าง 0.Dashboard และจัดระเบียบ 7 แท็บมาตรฐานสำเร็จเรียบร้อย!', 'สำเร็จ', 5);
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
    message: "Chemical Lab Realtime Backup Webhook is running." 
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
