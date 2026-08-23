// Mock DOM
global.document = {
  getElementById: (id) => {
    if (id === "activityLogsTableBody") return { innerHTML: "" };
    return null;
  }
};

let activityLogs = [
  { id: "log-1", timestamp: new Date(Date.now() - 1000*60*30).toISOString(), actor: "Admin", action: "เพิ่มสารเคมีใหม่", details: "เพิ่ม เอทานอล 95% (CHEM-010) เข้าระบบจำนวน 5 ขวด" },
  { id: "log-2", timestamp: new Date(Date.now() - 1000*60*120).toISOString(), actor: "Teacher", action: "อนุมัติการยืม", details: "อนุมัติคำขอยืม บีกเกอร์ 250ml ของ นายนภัทร" },
  { id: "log-3", timestamp: new Date(Date.now() - 1000*60*60*24).toISOString(), actor: "Student", action: "จองห้องปฏิบัติการ", details: "จองห้อง Lab 1 สำหรับวิชาเคมีอินทรีย์" }
];

function renderActivityLogs() {
  const tableBody = document.getElementById("activityLogsTableBody");
  if (!tableBody) return;

  if (activityLogs.length === 0) {
    tableBody.innerHTML = "EMPTY STATE";
    return;
  }

  let html = "";
  const logsToShow = activityLogs.slice(0, 100);
  
  logsToShow.forEach(log => {
    const d = new Date(log.timestamp);
    const dateStr = d.toLocaleDateString("th-TH") + " " + d.toLocaleTimeString("th-TH");
    let badgeClass = "badge-gray";
    if (log.actor === "Admin") badgeClass = "badge-red";
    else if (log.actor === "Teacher") badgeClass = "badge-blue";
    else if (log.actor === "Student") badgeClass = "badge-green";
    
    html += `ROW`;
  });
  tableBody.innerHTML = html;
  console.log("RENDER SUCCESS!");
}

try {
  renderActivityLogs();
} catch (e) {
  console.error("RENDER FAILED:", e);
}
