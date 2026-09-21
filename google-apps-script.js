/**
 * Chemical Laboratory Management System - Google Sheets Realtime Backup & Sync
 * ==============================================================================
 * วิธีใช้งาน:
 * 1. เปิด Google Sheet ที่ต้องการสำรองข้อมูล
 * 2. ไปที่ Extensions (ส่วนขยาย) > Apps Script
 * 3. ลบโค้ดเดิมทั้งหมดใน Code.gs แล้วนำโค้ดด้านล่างนี้ไปวางแทนที่ทั้งหมด
 * 4. กด บันทึก (Ctrl + S หรือไอคอนแผ่นดิสก์)
 * 5. กด Deploy (การทำให้ใช้งานได้) > Manage deployments (จัดการการทำให้ใช้งานได้)
 * 6. กดรูป ดินสอ (แก้ไข) > ในช่อง Version เลือก "New version (เวอร์ชันใหม่)" > กด Deploy (ทำให้ใช้งานได้)
 * ==============================================================================
 */

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
    var keyField = payload.keyField || 'id'; // Primary key field name (e.g. 'code', 'id', 'teacherId')

    if (action === 'PING') {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        message: "Google Apps Script Webhook is ready and active!" 
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

    // If sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet(table);
    }

    var result;
    if (action === 'DELETE') {
      result = deleteRow(sheet, data, keyField);
    } else {
      // Default: UPSERT (Insert if new, Update if exists)
      result = upsertRow(sheet, data, keyField);
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
    message: "Chemical Lab Realtime Backup Webhook is running." 
  })).setMimeType(ContentService.MimeType.JSON);
}

// -------------------------------------------------------------
// Predefined Preferred Column Order for Tables
// -------------------------------------------------------------
var PREFERRED_HEADERS = {
  'Bookings': [
    'วัน/เดือน/ปี ที่ใช้งาน',
    'เวลาที่เข้าใช้',
    'ระบุระดับชั้นของนักเรียนที่เข้าใช้งาน',
    'จำนวนนักเรียนที่เข้าใช้งานทั้งหมด',
    'ระบุกิจกรรมที่ใช้ (เช่น ทำ Lab เรื่อง............../การเรียนการสอนเรื่อง....../กิจกรรมชมรม เป็นต้น)',
    'ลงชื่อคุณครู (พิมพ์เฉพาะชื่อเท่านั้น)',
    'ห้องปฏิบัติการ',
    'สถานะ',
    'id',
    'createdAt'
  ]
};

// -------------------------------------------------------------
// Helper: UPSERT row in sheet
// -------------------------------------------------------------
function upsertRow(sheet, data, keyField) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var tableName = sheet.getName();

  // If sheet is completely empty, initialize header
  if (lastRow === 0 || lastCol === 0) {
    var headers = [];
    if (PREFERRED_HEADERS[tableName]) {
      headers = PREFERRED_HEADERS[tableName].slice();
      // Add any additional keys in data that aren't in preferred list
      Object.keys(data).forEach(function(k) {
        if (headers.indexOf(k) === -1) headers.push(k);
      });
    } else {
      headers = Object.keys(data);
    }

    sheet.appendRow(headers);
    formatHeaderRow(sheet, headers.length);
    var rowValues = headers.map(function(h) { 
      return formatValueForSheet(data[h]); 
    });
    sheet.appendRow(rowValues);
    autoFitSheetColumns(sheet, headers.length);
    return "created_sheet_and_inserted";
  }

  // Read current headers
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Add missing headers if new fields exist in data
  var dataKeys = Object.keys(data);
  var newHeadersAdded = false;
  dataKeys.forEach(function(k) {
    if (headers.indexOf(k) === -1) {
      headers.push(k);
      sheet.getRange(1, headers.length).setValue(k);
      newHeadersAdded = true;
    }
  });
  if (newHeadersAdded) {
    formatHeaderRow(sheet, headers.length);
  }

  var keyColIndex = headers.indexOf(keyField);
  var keyValue = data[keyField];

  // If key column not found or no key value, simply append
  if (keyColIndex === -1 || keyValue === undefined || keyValue === null || keyValue === "") {
    var rowValues = headers.map(function(h) { return formatValueForSheet(data[h]); });
    sheet.appendRow(rowValues);
    return "appended_no_key";
  }

  // Search existing rows for match
  var currentLastRow = sheet.getLastRow();
  var foundRowIndex = -1;
  if (currentLastRow > 1) {
    var idColumnValues = sheet.getRange(2, keyColIndex + 1, currentLastRow - 1, 1).getValues();
    for (var i = 0; i < idColumnValues.length; i++) {
      if (String(idColumnValues[i][0]).trim() === String(keyValue).trim()) {
        foundRowIndex = i + 2; // 1-indexed and skip header
        break;
      }
    }
  }

  var rowValues = headers.map(function(h) { return formatValueForSheet(data[h]); });

  if (foundRowIndex !== -1) {
    // Update existing row
    sheet.getRange(foundRowIndex, 1, 1, headers.length).setValues([rowValues]);
    return "updated_row_" + foundRowIndex;
  } else {
    // Insert new row
    sheet.appendRow(rowValues);
    return "inserted_new_row";
  }
}

// -------------------------------------------------------------
// Helper: DELETE row in sheet
// -------------------------------------------------------------
function deleteRow(sheet, data, keyField) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return "sheet_empty";

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var keyColIndex = headers.indexOf(keyField);
  var keyValue = data[keyField];

  if (keyColIndex === -1 || !keyValue) return "key_not_found";

  var idColumnValues = sheet.getRange(2, keyColIndex + 1, lastRow - 1, 1).getValues();
  for (var i = idColumnValues.length - 1; i >= 0; i--) {
    if (String(idColumnValues[i][0]).trim() === String(keyValue).trim()) {
      sheet.deleteRow(i + 2);
      return "deleted_row_" + (i + 2);
    }
  }
  return "row_not_found";
}

// -------------------------------------------------------------
// Helper: Format values (convert Objects/Arrays to readable JSON strings)
// -------------------------------------------------------------
function formatValueForSheet(val) {
  if (val === undefined || val === null) return "";
  if (typeof val === 'object') {
    return JSON.stringify(val);
  }
  return val;
}

// -------------------------------------------------------------
// Helper: Style header row nicely
// -------------------------------------------------------------
function formatHeaderRow(sheet, colCount) {
  var headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground("#1e293b"); // Slate dark
  headerRange.setFontColor("#ffffff");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
}

function autoFitSheetColumns(sheet, colCount) {
  try {
    for (var i = 1; i <= colCount; i++) {
      sheet.autoResizeColumn(i);
    }
  } catch (e) {}
}
