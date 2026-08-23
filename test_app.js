const fs = require('fs');
let content = fs.readFileSync('app.js', 'utf8');

// Mock browser APIs
global.window = {
  location: { reload: () => console.log('RELOAD CALLED'), replace: () => {} },
  addEventListener: () => {}
};
global.navigator = {};
global.document = {
  getElementById: (id) => ({
    addEventListener: () => {},
    style: {},
    classList: { add: () => {}, remove: () => {} },
    innerHTML: ''
  }),
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add: () => {}, remove: () => {} } }),
  body: { appendChild: () => {}, addEventListener: () => {} }
};
global.localStorage = {
  _data: {},
  setItem: function(id, val) { return this._data[id] = String(val); },
  getItem: function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : null; },
  removeItem: function(id) { return delete this._data[id]; },
  clear: function() { return this._data = {}; }
};
global.TODAY = new Date();

// Try to eval app.js
try {
  eval(content);
  console.log('EVAL SUCCESS');
  console.log('Mock Data Inserted:', !!global.localStorage.getItem('full_mock_v1'));
  console.log('Activity Logs Length:', JSON.parse(global.localStorage.getItem('lab_activity_logs') || '[]').length);
} catch (e) {
  console.error('ERROR IN APP.JS:', e);
}
