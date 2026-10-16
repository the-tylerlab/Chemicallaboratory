const fs = require('fs');
const path = require('path');

const bookingsFilePath = path.join(__dirname, '..', 'data', 'bookings.json');
let existingBookings = [];
try {
  existingBookings = JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8'));
} catch (e) {
  existingBookings = [];
}

const teachers = [
  { id: 'u_10746', name: 'ม.สุวรรณ ชิดประสงค์' },
  { id: 'u_10797', name: 'ม.ธนันกรกานต์ พิจารณา' },
  { id: 'u_1001', name: 'ครูสมชาย รักการสอน' },
  { id: 'u_1002', name: 'ครูวิภาดา ใฝ่รู้' },
  { id: 'u_10823', name: 'ม.วงศกร ด้วงเกลี้ยง' },
  { id: 'u_10572', name: 'มิสพิชชาพร ประยูรอนุเทพ' },
  { id: 'u_admin', name: 'อาจารย์ผู้ดูแลระบบ (Admin)' },
  { id: 'u_teacher_1', name: 'อ.พรทิพย์ มั่งมี' },
  { id: 'u_teacher_2', name: 'ม.รัชกฤช สุขใจ' },
  { id: 'u_teacher_3', name: 'แก้วกาญจน์ เฮงทองเลิศ' },
  { id: 'u_teacher_4', name: 'ชุติมา ผาสุข' },
  { id: 'u_teacher_5', name: 'มิสปริยากรณ์ ใจงาม' },
  { id: 'u_teacher_6', name: 'Teacher David Miller' }
];

const rooms = ['Lab 1', 'Lab 2', 'Lab 3', 'Lab 4', 'Lab 5', 'Lab 6', 'Lab 7', 'Lab 8'];

const classes = [
  'ม.1/1', 'ม.1/2', 'ม.1/3', 'ม.1/4',
  'ม.2/1', 'ม.2/2', 'ม.2/3', 'ม.2/4',
  'ม.3/1', 'ม.3/2', 'ม.3/3', 'ม.3/4',
  'ม.4/1', 'ม.4/2', 'ม.4/3',
  'ม.5/1', 'ม.5/2', 'ม.5/3',
  'ม.6/1', 'ม.6/2', 'ม.6/3',
  'EP-M.1', 'EP-M.2', 'EP-M.3', 'EP-M.4', 'EP-M.5'
];

const timeSlots = [
  '08:30 - 10:20',
  '10:30 - 12:20',
  '13:00 - 14:50',
  '15:00 - 16:50',
  '1, 2',
  '3, 4',
  '5, 6',
  '7, 8'
];

const experimentTemplates = [
  {
    purpose: 'การทดลองไทเทรตกรด-เบส (Acid-Base Titration)',
    experimentName: 'Acid-Base Titration',
    room: 'Lab 1',
    equipment: [{ name: 'Burette 50mL', qty: 12 }, { name: 'Erlenmeyer Flask 250mL', qty: 36 }],
    chemicals: [{ name: 'HCl 0.1M', qty: 500, unit: 'mL' }, { name: 'NaOH 0.1M', qty: 500, unit: 'mL' }]
  },
  {
    purpose: 'การเตรียมสารละลายมาตรฐานและเจือจางความเข้มข้น',
    experimentName: 'Standard Solution Preparation',
    room: 'Lab 1',
    equipment: [{ name: 'Volumetric Flask 100mL', qty: 24 }, { name: 'Pipette 10mL', qty: 12 }],
    chemicals: [{ name: 'NaCl analytical grade', qty: 100, unit: 'g' }, { name: 'Distilled Water', qty: 2000, unit: 'mL' }]
  },
  {
    purpose: 'การทดสอบอัตราการเกิดปฏิกิริยาเคมีและอุณหภูมิ',
    experimentName: 'Reaction Rate vs Temperature',
    room: 'Lab 1',
    equipment: [{ name: 'Water Bath', qty: 4 }, { name: 'Thermometer 0-100C', qty: 12 }, { name: 'Stopwatch', qty: 12 }],
    chemicals: [{ name: 'Na2S2O3 0.1M', qty: 600, unit: 'mL' }, { name: 'HCl 1.0M', qty: 300, unit: 'mL' }]
  },
  {
    purpose: 'การแยกสารด้วยเทคนิคโครมาโทกราฟีกระดาษ',
    experimentName: 'Paper Chromatography',
    room: 'Lab 1',
    equipment: [{ name: 'Chromatography Chamber', qty: 8 }, { name: 'Capillary Tube', qty: 50 }],
    chemicals: [{ name: 'Ethanol 95%', qty: 400, unit: 'mL' }, { name: 'Food Coloring Set', qty: 4, unit: 'sets' }]
  },
  {
    purpose: 'การเคลื่อนที่แบบฮาร์มอนิกอย่างง่ายและลูกตุ้มนาฬิกา',
    experimentName: 'Simple Harmonic Motion & Pendulum',
    room: 'Lab 2',
    equipment: [{ name: 'Retort Stand & Clamp', qty: 12 }, { name: 'Metal Bob Set', qty: 12 }, { name: 'Digital Stopwatch', qty: 12 }],
    chemicals: []
  },
  {
    purpose: 'การทดลองหาค่าความเร่งโน้มถ่วงของโลก (g) ด้วยแถบกระดาษเคาะสัญญาณ',
    experimentName: 'Ticker Timer & Gravity (g)',
    room: 'Lab 2',
    equipment: [{ name: 'Ticker Timer 50Hz', qty: 10 }, { name: 'Low Voltage AC Power Supply', qty: 10 }, { name: 'Carbon Paper Disc & Tape', qty: 20 }],
    chemicals: []
  },
  {
    purpose: 'การเลี้ยวเบนและการแทรกสอดของแสงเลเซอร์',
    experimentName: 'Laser Diffraction & Interference',
    room: 'Lab 2',
    equipment: [{ name: 'Red Diode Laser 650nm', qty: 8 }, { name: 'Double Slit Slide', qty: 8 }, { name: 'Optical Bench', qty: 8 }],
    chemicals: []
  },
  {
    purpose: 'การต่อวงจรไฟฟ้ากระแสตรงและกฎของโอห์ม',
    experimentName: 'Ohm’s Law & DC Circuits',
    room: 'Lab 2',
    equipment: [{ name: 'Digital Multimeter', qty: 15 }, { name: 'Variable Resistor Box', qty: 15 }, { name: 'DC Power Source 0-12V', qty: 10 }],
    chemicals: []
  },
  {
    purpose: 'การศึกษาเซลล์เยื่อบุหัวหอมและเยื่อบุข้างแก้มด้วยกล้องจุลทรรศน์',
    experimentName: 'Plant and Animal Cell Microscopy',
    room: 'Lab 3',
    equipment: [{ name: 'Compound Microscope', qty: 16 }, { name: 'Glass Slide & Cover Slip', qty: 50 }],
    chemicals: [{ name: 'Methylene Blue solution', qty: 100, unit: 'mL' }, { name: 'Iodine Solution', qty: 100, unit: 'mL' }]
  },
  {
    purpose: 'การสังเคราะห์ด้วยแสงและการคายน้ำของพืช',
    experimentName: 'Photosynthesis & Transpiration Rate',
    room: 'Lab 3',
    equipment: [{ name: 'Potometer', qty: 6 }, { name: 'Test Tube Rack', qty: 12 }, { name: 'LED Grow Lamp', qty: 4 }],
    chemicals: [{ name: 'Phenol Red indicator', qty: 100, unit: 'mL' }, { name: 'NaHCO3 1%', qty: 500, unit: 'mL' }]
  },
  {
    purpose: 'การสกัดดีเอ็นเออย่างง่ายจากพืช (สตรอว์เบอร์รีและกล้วยน้ำว้า)',
    experimentName: 'Simple Plant DNA Extraction',
    room: 'Lab 3',
    equipment: [{ name: 'Mortar and Pestle', qty: 10 }, { name: 'Cheesecloth filter', qty: 10 }, { name: 'Glass Rod', qty: 20 }],
    chemicals: [{ name: 'Ice-cold Ethanol 95%', qty: 500, unit: 'mL' }, { name: 'Dish Soap Solution', qty: 200, unit: 'mL' }, { name: 'NaCl', qty: 50, unit: 'g' }]
  },
  {
    purpose: 'การทดสอบการทำงานของเอนไซม์คะตาเลสในเซลล์สิ่งมีชีวิต',
    experimentName: 'Catalase Enzyme Activity',
    room: 'Lab 4',
    equipment: [{ name: 'Graduated Cylinder 10mL', qty: 12 }, { name: 'Water Bath 37C', qty: 2 }],
    chemicals: [{ name: 'H2O2 3%', qty: 300, unit: 'mL' }, { name: 'Buffer pH 7.0', qty: 250, unit: 'mL' }]
  },
  {
    purpose: 'STEM Activity: การออกแบบและประดิษฐ์เครื่องกรองน้ำชีวภาพ',
    experimentName: 'STEM Water Filtration System',
    room: 'Lab 7',
    equipment: [{ name: 'Acrylic Column', qty: 8 }, { name: 'TDS Meter', qty: 6 }, { name: 'pH Pen Tester', qty: 6 }],
    chemicals: [{ name: 'Activated Carbon', qty: 500, unit: 'g' }, { name: 'Silica Sand', qty: 1000, unit: 'g' }]
  },
  {
    purpose: 'STEM Activity: เครื่องตรวจวัดคุณภาพอากาศและเซนเซอร์ IoT',
    experimentName: 'IoT Air Quality & Environmental Station',
    room: 'Lab 7',
    equipment: [{ name: 'Microcontroller Kit (ESP32)', qty: 10 }, { name: 'Dust Sensor PM2.5', qty: 10 }, { name: 'Breadboard & Jumper Wires', qty: 15 }],
    chemicals: []
  },
  {
    purpose: 'โครงงานวิทยาศาสตร์: พลาสติกชีวภาพจากแป้งข้าวโพดและเปลือกกล้วย',
    experimentName: 'Bio-plastics Project',
    room: 'Lab 8',
    equipment: [{ name: 'Hotplate Stirrer', qty: 6 }, { name: 'Silicone Mold Set', qty: 10 }],
    chemicals: [{ name: 'Glycerol analytical', qty: 250, unit: 'mL' }, { name: 'Corn Starch', qty: 500, unit: 'g' }, { name: 'Vinegar 5%', qty: 500, unit: 'mL' }]
  },
  {
    purpose: 'เตรียมความพร้อมแล็บวิทย์ สสวท. ฟิสิกส์-เคมี-ชีวะ',
    experimentName: 'IPST Science Special Lab Workshop',
    room: 'Lab 5',
    equipment: [{ name: 'Sensor Interface Box', qty: 8 }, { name: 'Photogate Timer', qty: 16 }],
    chemicals: [{ name: 'Standard Buffer Set', qty: 1, unit: 'box' }]
  },
  {
    purpose: 'ปฏิบัติการเคมีอินทรีย์: การสังเคราะห์เอสเทอร์และกลิ่นผลไม้',
    experimentName: 'Esterification & Organic Aroma Synthesis',
    room: 'Lab 6',
    equipment: [{ name: 'Reflux Condenser', qty: 8 }, { name: 'Round Bottom Flask 100mL', qty: 8 }, { name: 'Heating Mantle', qty: 8 }],
    chemicals: [{ name: 'Glacial Acetic Acid', qty: 200, unit: 'mL' }, { name: 'Ethanol 99%', qty: 250, unit: 'mL' }, { name: 'H2SO4 conc.', qty: 50, unit: 'mL' }]
  }
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Generate 150 bookings:
// Distribution:
// Past (2026-08-01 to 2026-10-15): 60 items (approved: 45, rejected: 15)
// Current/Near (2026-10-16 to 2026-10-20): 20 items (approved: 10, pending: 8, rejected: 2)
// Future (2026-10-21 to 2026-12-31): 70 items (pending: 42, approved: 20, rejected: 8)
// Total = 150 items

const generatedBookings = [];
const baseTimestamp = 1792130000000;

function createBooking(index, dateStr, status) {
  const template = getRandomItem(experimentTemplates);
  const teacher = getRandomItem(teachers);
  const className = getRandomItem(classes);
  const studentCount = getRandomInt(28, 45);
  const timeSlot = getRandomItem(timeSlots);
  const room = template.room || getRandomItem(rooms);
  const bookingId = `BK-${baseTimestamp + (index * 864000) + getRandomInt(100, 999)}`;

  const createdDate = new Date(dateStr + 'T08:30:00.000Z');
  // Created 2 to 7 days before booking date
  createdDate.setDate(createdDate.getDate() - getRandomInt(2, 7));

  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';

  const booking = {
    id: bookingId,
    room: room,
    date: dateStr,
    timeSlot: timeSlot,
    slot: timeSlot,
    purpose: template.purpose,
    teacherId: teacher.id,
    teacherName: teacher.name,
    bookerName: teacher.name,
    className: className,
    gradeLevel: className,
    studentCount: studentCount,
    experimentName: template.experimentName,
    requiredEquipment: template.equipment,
    requiredChemicals: template.chemicals,
    prepItems: [
      ...template.chemicals.map(c => ({ name: c.name, qty: c.qty, unit: c.unit })),
      ...template.equipment.map(e => ({ name: e.name, qty: e.qty, unit: 'ชิ้น' }))
    ],
    preparationChecklist: [
      { task: 'จัดเตรียมสารเคมีตามสูตร', done: isApproved, updatedAt: isApproved ? createdDate.toISOString() : undefined, updatedBy: isApproved ? 'อาจารย์ผู้ดูแลระบบ (Admin)' : undefined },
      { task: 'ตรวจสอบเครื่องแก้วและอุปกรณ์', done: isApproved && Math.random() > 0.3 },
      { task: 'จัดวางอุปกรณ์ประจำโต๊ะปฏิบัติการ', done: isApproved && Math.random() > 0.5 }
    ],
    cleanupChecklist: [
      { task: 'ตรวจนับเครื่องแก้วส่งคืน', done: false },
      { task: 'แยกขยะสารเคมีอันตราย', done: false },
      { task: 'ทำความสะอาดและปิดวาล์วแก๊ส', done: false }
    ],
    status: status,
    createdAt: createdDate.toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (isApproved) {
    const reviewDate = new Date(createdDate.getTime() + getRandomInt(3600000, 86400000));
    booking.reviewedBy = 'อาจารย์ผู้ดูแลระบบ (Admin)';
    booking.reviewed_by = 'อาจารย์ผู้ดูแลระบบ (Admin)';
    booking.reviewedAt = reviewDate.toISOString();
    booking.reviewed_at = reviewDate.toISOString();
  } else if (isRejected) {
    const reviewDate = new Date(createdDate.getTime() + getRandomInt(3600000, 86400000));
    booking.reviewedBy = 'อาจารย์ผู้ดูแลระบบ (Admin)';
    booking.reviewed_by = 'อาจารย์ผู้ดูแลระบบ (Admin)';
    booking.reviewedAt = reviewDate.toISOString();
    booking.reviewed_at = reviewDate.toISOString();
    booking.rejectionReason = getRandomItem([
      'ห้องปฏิบัติการมีการใช้งานซ้อนในช่วงเวลาดังกล่าว ขอให้เลือกช่วงเวลาอื่น',
      'อุปกรณ์บางรายการอยู่ระหว่างการสอบเทียบและการบำรุงรักษาประจำภาคเรียน',
      'สารเคมีในคลังไม่เพียงพอต่อจำนวนนักเรียนในกลุ่มทดลองนี้',
      'มีกิจกรรมสัมมนาและอบรมความปลอดภัยในห้องปฏิบัติการ'
    ]);
  }

  return booking;
}

let currentIndex = 1;

// 1. Past dates: 60 items (Aug 01 to Oct 15, 2026)
for (let i = 0; i < 60; i++) {
  // random day between Aug 1 and Oct 15 (approx 75 days)
  const pastDayOffset = getRandomInt(1, 75);
  const d = new Date(2026, 9, 15); // Oct 15, 2026
  d.setDate(d.getDate() - pastDayOffset);
  const status = i < 45 ? 'approved' : 'rejected';
  generatedBookings.push(createBooking(currentIndex++, formatDate(d), status));
}

// 2. Current/Near dates: 20 items (Oct 16 to Oct 20, 2026)
for (let i = 0; i < 20; i++) {
  const d = new Date(2026, 9, 16);
  d.setDate(d.getDate() + getRandomInt(0, 4));
  let status = 'pending';
  if (i < 10) status = 'approved';
  else if (i < 12) status = 'rejected';
  else status = 'pending';
  generatedBookings.push(createBooking(currentIndex++, formatDate(d), status));
}

// 3. Future dates: 70 items (Oct 21 to Dec 31, 2026)
for (let i = 0; i < 70; i++) {
  // random day between 5 and 75 days ahead
  const d = new Date(2026, 9, 21);
  d.setDate(d.getDate() + getRandomInt(0, 70));
  let status = 'pending';
  if (i < 42) status = 'pending';
  else if (i < 62) status = 'approved';
  else status = 'rejected';
  generatedBookings.push(createBooking(currentIndex++, formatDate(d), status));
}

console.log(`Generated ${generatedBookings.length} bookings.`);
const statusCounts = generatedBookings.reduce((acc, b) => {
  acc[b.status] = (acc[b.status] || 0) + 1;
  return acc;
}, {});
console.log('Status counts:', statusCounts);

// Combine with existing bookings
const combinedBookings = [...existingBookings, ...generatedBookings];
fs.writeFileSync(bookingsFilePath, JSON.stringify(combinedBookings, null, 2), 'utf8');
console.log(`Total bookings now in ${bookingsFilePath}: ${combinedBookings.length}`);
