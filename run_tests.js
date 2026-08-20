const puppeteer = require('puppeteer');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log("🚀 เริ่มการทดสอบระบบอัตโนมัติ (Automated System Verification)");
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Catch console logs from the page for debugging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    
    console.log("🌐 กำลังเปิดหน้าเว็บ http://localhost:3000");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // --- TEST 1: Inventory System ---
    console.log("🧪 [Test 1] กำลังทดสอบระบบคลังพัสดุ (Inventory System)");
    await page.click('.sidebar-nav-item[data-target="inventory"]');
    await delay(500); // wait for page transition
    
    // Fill Add Item Form
    const testCode = 'AUTO-001';
    await page.type('#itemCode', testCode);
    await page.type('#itemName', 'สารเคมีทดสอบอัตโนมัติ');
    await page.select('#itemCategory', 'สารเคมี (Chemical)');
    await page.type('#itemQuantity', '100');
    await page.type('#itemMinStock', '20');
    await page.type('#itemLocation', 'Cabinet A1');
    
    await page.click('#btnSubmitItem');
    
    // Wait for toast
    await page.waitForFunction(() => {
      const toasts = document.querySelectorAll('.toast');
      return Array.from(toasts).some(t => t.innerText.includes('เพิ่มพัสดุ'));
    }, { timeout: 5000 });
    console.log("✅ เพิ่มรายการพัสดุสำเร็จ");
    
    // Search for the item
    await page.type('#searchInput', testCode);
    await delay(1000); // wait for search debounce/render
    const foundItem = await page.evaluate((code) => {
      const rows = document.querySelectorAll('#itemsTableBody tr');
      for (const row of rows) {
        if (row.innerText.includes(code)) return true;
      }
      return false;
    }, testCode);
    
    if (foundItem) {
      console.log("✅ ค้นหารายการที่พึ่งเพิ่มเจอในตาราง");
    } else {
      throw new Error("❌ ไม่พบรายการพัสดุในตารางหลังจากการเพิ่ม");
    }

    // --- TEST 2: Purchase Order System ---
    console.log("🧪 [Test 2] กำลังทดสอบระบบบันทึกรายการสั่งซื้อ (Purchase Order System)");
    await page.click('.sidebar-nav-item[data-target="purchase-orders"]');
    await delay(500);
    
    // Add to Draft
    const poCode = 'PO-AUTO-001';
    await page.type('#poProductCode', poCode);
    await page.type('#poProductName', 'อุปกรณ์ทดสอบอัตโนมัติ');
    await page.type('#poUnitPrice', '150');
    await page.type('#poQuantity', '2');
    
    await page.click('#btnSubmitPurchaseOrder');
    
    // Wait for draft toast
    await page.waitForFunction(() => {
      const toasts = document.querySelectorAll('.toast');
      return Array.from(toasts).some(t => t.innerText.includes('เพิ่มรายการสินค้าลงตารางชั่วคราว'));
    }, { timeout: 5000 });
    console.log("✅ เพิ่มรายการลงตารางชั่วคราวสำเร็จ");
    
    await delay(1000); // wait for animation to settle
    
    // Commit Draft
    await page.click('#btnCommitPoDraft');
    
    // Wait for commit toast
    await page.waitForFunction(() => {
      const toasts = document.querySelectorAll('.toast');
      return Array.from(toasts).some(t => t.innerText.includes('บันทึกรายการสั่งซื้อทั้งหมดสำเร็จ'));
    }, { timeout: 5000 });
    console.log("✅ ยืนยันบันทึกใบสั่งซื้อทั้งหมดสำเร็จ");
    
    await delay(1000); // wait for table render
    
    // Check if PO exists in table
    const foundPO = await page.evaluate((code) => {
      const rows = document.querySelectorAll('#purchaseOrdersTableBody tr');
      for (const row of rows) {
        if (row.innerText.includes(code)) return true;
      }
      return false;
    }, poCode);
    
    if (foundPO) {
      console.log("✅ รายการสั่งซื้อแสดงในตารางสำเร็จ (ฟิลเตอร์ทำงานถูกต้อง)");
    } else {
      throw new Error("❌ ไม่พบรายการสั่งซื้อในตารางหลัก");
    }

    // --- TEST 3: Room Booking System ---
    console.log("🧪 [Test 3] กำลังทดสอบระบบจองห้องปฏิบัติการ (Lab Booking Suite)");
    await page.click('.sidebar-nav-item[data-target="booking"]');
    await delay(500);
    
    await page.type('#bookingName', 'นักเรียนทดสอบ');
    await page.select('#bookingRoom', 'ห้องปฏิบัติการเคมี 1');
    // Set date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    await page.type('#bookingDate', dateStr);
    
    // Click submit
    await page.click('#btnSubmitBooking');
    
    // Wait for confirmation modal
    await page.waitForSelector('#bookingConfirmModal', { visible: true, timeout: 5000 });
    console.log("✅ สร้างคำขอจองห้องแล็บและแสดงหน้าต่างยืนยันสำเร็จ");
    
    console.log("🎉 การทดสอบระบบทั้งหมดผ่านฉลุย! (ALL TESTS PASSED)");

  } catch (error) {
    console.error("❌ การทดสอบล้มเหลว (TEST FAILED):", error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
