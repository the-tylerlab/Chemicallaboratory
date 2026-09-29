/**
 * Database Migration Script
 * 1. Hashes all plaintext passwords in data/users.json using bcrypt
 * 2. Synchronizes all users into Supabase 'users' table
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://avzneyaalenbyawfvykp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_iqpHDJXb983_PwFSoSDV9w_kd2pvKoj';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function migrate() {
  console.log('🔄 Starting user password hashing & Supabase synchronization...');
  
  if (!fs.existsSync(USERS_FILE)) {
    console.error('❌ users.json not found at', USERS_FILE);
    process.exit(1);
  }

  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  let users = JSON.parse(raw);
  console.log(`📋 Found ${users.length} users in local file.`);

  // 1. Fetch any users already in Supabase to merge
  try {
    const { data: supaUsers, error } = await supabase.from('users').select('*');
    if (!error && Array.isArray(supaUsers)) {
      supaUsers.forEach(su => {
        const idx = users.findIndex(u => u.id === su.id || u.teacherId === su.teacherId);
        if (idx === -1) {
          users.push(su);
        }
      });
    }
  } catch (err) {
    console.warn('⚠️ Warning querying Supabase:', err.message);
  }

  // 2. Hash passwords
  let hashedCount = 0;
  users = users.map(user => {
    let pwd = String(user.password || user.teacherId || '1234').trim();
    // Check if already bcrypt hash
    if (!pwd.startsWith('$2a$') && !pwd.startsWith('$2b$')) {
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(pwd, salt);
      hashedCount++;
    }
    // Clean up properties
    user.role = user.role || 'L1';
    user.isActive = user.isActive !== false;
    user.assignedRooms = Array.isArray(user.assignedRooms) ? user.assignedRooms : [];
    return user;
  });

  console.log(`🔒 Hashed ${hashedCount} plaintext passwords.`);

  // 3. Save to local data/users.json
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  console.log(`💾 Saved ${users.length} users with hashed passwords to ${USERS_FILE}`);

  // 4. Upsert all into Supabase
  console.log('☁️ Uploading users to Supabase...');
  let supaSuccess = 0;
  for (const user of users) {
    try {
      const payload = {
        id: user.id || ('u_' + user.teacherId),
        teacherId: String(user.teacherId || '').trim(),
        name: user.name || 'User',
        department: user.department || '',
        email: user.email || '',
        role: user.role || 'L1',
        roleName: user.roleName || 'Teacher / User',
        assignedRooms: user.assignedRooms || [],
        password: user.password, // bcrypt hash
        initials: user.initials || 'U',
        color: user.color || '#3b82f6',
        isActive: user.isActive !== false,
        createdAt: user.createdAt || new Date().toISOString()
      };

      const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn(`⚠️ Failed to upsert ${user.teacherId}:`, error.message);
      } else {
        supaSuccess++;
      }
    } catch (e) {
      console.warn(`⚠️ Error uploading ${user.teacherId}:`, e.message);
    }
  }

  console.log(`✅ Successfully synced ${supaSuccess}/${users.length} users to Supabase!`);
}

migrate().then(() => {
  console.log('🎉 Migration complete!');
  process.exit(0);
}).catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
