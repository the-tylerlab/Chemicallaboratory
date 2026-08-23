// Mock localStorage
const store = {};
global.localStorage = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => store[key] = String(val)
};
global.window = { location: { reload: () => console.log('RELOAD CALLED') } };

(function seedAllMockData() {
  if (!localStorage.getItem("full_mock_v1")) {
    let logs = JSON.parse(localStorage.getItem("lab_activity_logs") || "[]");
    if (logs.length === 0) {
      logs = [
        { id: "log-1", timestamp: new Date(Date.now() - 1000*60*30).toISOString(), actor: "Admin", action: "เพิ่มสารเคมีใหม่", details: "เพิ่ม เอทานอล 95% (CHEM-010) เข้าระบบจำนวน 5 ขวด" }
      ];
      localStorage.setItem("lab_activity_logs", JSON.stringify(logs));
    }
    localStorage.setItem("full_mock_v1", "true");
    console.log("Seeded full mock data!");
    window.location.reload();
  }
})();

console.log("Logs in storage:", localStorage.getItem("lab_activity_logs"));
