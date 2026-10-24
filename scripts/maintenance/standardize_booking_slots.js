require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const bookingsFilePath = path.join(__dirname, '..', '..', 'data', 'bookings.json');
const bookings = JSON.parse(fs.readFileSync(bookingsFilePath, 'utf8'));

function standardizeSlot(b) {
  const raw = String(b.slot || b.timeSlot || '').trim();

  if (raw.includes('10:30') || raw.includes('12:20') || raw === '4, 5' || raw === '4,5' || raw.includes('คาบ 4, 5') || raw.includes('คาบ 4 - 5')) {
    return { slot: 'คาบ 4 - 5', timeSlot: '10:50 - 12:30' };
  }
  if (raw.includes('08:30') || raw === '1, 2' || raw === '1,2' || raw.includes('คาบ 1, 2') || raw.includes('คาบ 1 - 2')) {
    return { slot: 'คาบ 1 - 2', timeSlot: '08:10 - 09:50' };
  }
  if (raw.includes('09:20') || raw === '2, 3' || raw === '2,3' || raw.includes('คาบ 2, 3') || raw.includes('คาบ 2 - 3')) {
    return { slot: 'คาบ 2 - 3', timeSlot: '09:00 - 10:40' };
  }
  if (raw === '3, 4' || raw === '3,4' || raw.includes('คาบ 3, 4') || raw.includes('คาบ 3 - 4')) {
    return { slot: 'คาบ 3 - 4', timeSlot: '09:50 - 11:40' };
  }
  if (raw === '5, 6' || raw === '5,6' || raw.includes('คาบ 5, 6') || raw.includes('คาบ 5 - 6')) {
    return { slot: 'คาบ 5 - 6', timeSlot: '11:40 - 14:10' };
  }
  if (raw.includes('13:00') || raw === '6, 7' || raw === '6,7' || raw.includes('คาบ 6, 7') || raw.includes('คาบ 6 - 7')) {
    return { slot: 'คาบ 6 - 7', timeSlot: '13:20 - 15:00' };
  }
  if (raw.includes('15:00') || raw.includes('16:50') || raw === '7, 8' || raw === '7,8' || raw.includes('คาบ 7, 8') || raw.includes('คาบ 7 - 8')) {
    return { slot: 'คาบ 7 - 8', timeSlot: '14:10 - 16:00' };
  }
  if (raw === '1' || raw === 'คาบ 1') return { slot: 'คาบ 1', timeSlot: '08:10 - 09:00' };
  if (raw === '2' || raw === 'คาบ 2') return { slot: 'คาบ 2', timeSlot: '09:00 - 09:50' };
  if (raw === '3' || raw === 'คาบ 3') return { slot: 'คาบ 3', timeSlot: '09:50 - 10:40' };
  if (raw === '4' || raw === 'คาบ 4') return { slot: 'คาบ 4', timeSlot: '10:50 - 11:40' };
  if (raw === '5' || raw === 'คาบ 5') return { slot: 'คาบ 5', timeSlot: '11:40 - 12:30' };
  if (raw === '6' || raw === 'คาบ 6') return { slot: 'คาบ 6', timeSlot: '13:20 - 14:10' };
  if (raw === '7' || raw === 'คาบ 7') return { slot: 'คาบ 7', timeSlot: '14:10 - 15:00' };
  if (raw === '8' || raw === 'คาบ 8') return { slot: 'คาบ 8', timeSlot: '15:10 - 16:00' };

  return { slot: raw, timeSlot: raw };
}

let modifiedCount = 0;
bookings.forEach(b => {
  const norm = standardizeSlot(b);
  if (b.slot !== norm.slot || b.timeSlot !== norm.timeSlot) {
    b.slot = norm.slot;
    b.timeSlot = norm.timeSlot;
    modifiedCount++;
  }
});

fs.writeFileSync(bookingsFilePath, JSON.stringify(bookings, null, 2), 'utf8');
console.log(`Standardized ${modifiedCount} bookings in JSON.`);

if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  (async () => {
    const rows = bookings.map(b => ({
      id: b.id,
      room: b.room,
      date: b.date,
      slot: b.slot,
      bookerName: b.bookerName || b.teacherName || '',
      purpose: b.purpose || b.experimentName || '',
      prepItems: b.prepItems || b.requiredChemicals || b.requiredEquipment || [],
      status: b.status || 'pending',
      createdAt: b.createdAt || new Date().toISOString()
    }));

    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { error } = await sb.from('bookings').upsert(chunk, { onConflict: 'id' });
      if (error) console.error('Supabase error:', error.message);
    }
    console.log('Successfully synced standardized slots to Supabase!');
  })();
}
