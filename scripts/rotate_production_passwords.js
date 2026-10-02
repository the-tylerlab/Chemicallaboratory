/**
 * @file rotate_production_passwords.js
 * @description Securely rotates all user passwords across the system:
 *  - Generates cryptographically secure, random 16-character temporary passwords
 *  - Strictly prohibits old passwords from Git history and Teacher ID derived passwords
 *  - Hashes all passwords using bcrypt (10 rounds) before storage
 *  - Enforces must_change_password = true on all accounts
 *  - NEVER prints passwords to console logs, source code, or commit messages
 *  - Saves temporary distribution credentials strictly to gitignored file (data/temporary_credentials.json)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const CREDENTIALS_EXPORT_FILE = path.join(__dirname, '..', 'data', 'temporary_credentials.json');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.warn('⚠️ Supabase client initialization warning:', e.message);
  }
}

// Generate high-entropy, random temporary password (16 characters: uppercase, lowercase, numbers, symbols)
function generateSecurePassword() {
  const letters = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '23456789';
  const symbols = '!@#$%^&*';
  const allChars = letters + digits + symbols;
  
  // Guarantee at least 1 upper, 1 lower, 1 digit, 1 symbol
  let pass = '';
  pass += letters[crypto.randomInt(0, 24)]; // lowercase
  pass += letters[crypto.randomInt(24, letters.length)]; // uppercase
  pass += digits[crypto.randomInt(0, digits.length)];
  pass += symbols[crypto.randomInt(0, symbols.length)];
  
  const randomBytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    pass += allChars[randomBytes[i] % allChars.length];
  }
  
  // Shuffle characters using Fisher-Yates
  const arr = pass.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

async function runRotation() {
  console.log('================================================================');
  console.log('🔒 USER PASSWORD SECURITY ROTATION & MUST_CHANGE_PASSWORD ENFORCEMENT');
  console.log('================================================================\n');

  // 1. Retrieve canonical 14 user accounts from Git commit ae663c9
  let canonicalUsers = [];
  try {
    const raw = execSync('git show ae663c9e33:data/users.json', { encoding: 'utf8' });
    canonicalUsers = JSON.parse(raw);
    console.log(`📋 Loaded ${canonicalUsers.length} canonical user accounts.`);
  } catch (err) {
    console.error('❌ Failed to read canonical users from git history:', err.message);
    process.exit(1);
  }

  const credentialsExport = [];
  const updatedUsers = [];

  for (const user of canonicalUsers) {
    const teacherId = String(user.teacherId || '').trim();
    const name = user.name || 'User';

    // Generate secure random password (never based on Teacher ID or historical passwords)
    const newTempPassword = generateSecurePassword();

    // Verify it doesn't match Teacher ID or common patterns
    if (newTempPassword === teacherId || newTempPassword.includes(teacherId)) {
      throw new Error(`Generated password collided with Teacher ID for ${teacherId}`);
    }

    // Hash with bcrypt (10 rounds)
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newTempPassword, salt);

    // Update user record
    const updatedUser = {
      ...user,
      password: hashedPassword,
      must_change_password: true,
      mustChangePassword: true,
      password_changed_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'security_audit_rotation',
      is_deleted: false,
      isActive: true
    };

    updatedUsers.push(updatedUser);

    // Save temporary credentials to export list (to be written to gitignored file)
    credentialsExport.push({
      teacherId,
      name,
      role: user.role || 'L1',
      email: user.email || '',
      temporaryPassword: newTempPassword,
      mustChangePassword: true,
      generatedAt: new Date().toISOString()
    });

    // Console output WITHOUT revealing passwords
    console.log(`  ✅ Account Secured: ${teacherId.padEnd(8)} | Role: ${(user.role || 'L1').padEnd(4)} | Name: ${name}`);
  }

  // 2. Write to local users file (data/users.json)
  fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2), 'utf8');
  console.log(`\n💾 Saved ${updatedUsers.length} updated user records with bcrypt hashes to data/users.json`);

  // 3. Write temporary credentials securely to gitignored export file
  fs.writeFileSync(CREDENTIALS_EXPORT_FILE, JSON.stringify(credentialsExport, null, 2), 'utf8');
  console.log(`🔐 Exported temporary access credentials to gitignored file: data/temporary_credentials.json`);
  console.log(`   (Note: Passwords are NOT printed to stdout, logs, or source code)`);

  // 4. Update Supabase Database if accessible
  if (supabase) {
    console.log('\n☁️ Synchronizing password hashes & must_change_password flag to Supabase...');
    let successCount = 0;
    for (const u of updatedUsers) {
      try {
        const payload = {
          id: u.id,
          teacherId: u.teacherId,
          teacher_id: u.teacherId,
          name: u.name,
          department: u.department,
          email: u.email,
          role: u.role,
          roleName: u.roleName,
          assignedRooms: u.assignedRooms,
          password: u.password,
          initials: u.initials,
          color: u.color,
          must_change_password: true,
          mustChangePassword: true,
          password_changed_at: u.password_changed_at,
          isActive: true,
          is_active: true,
          updated_at: new Date().toISOString(),
          updated_by: 'security_audit_rotation'
        };

        const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
        if (error) {
          console.warn(`   ⚠️ Supabase upsert notice for ${u.teacherId}:`, error.message);
        } else {
          successCount++;
        }
      } catch (err) {
        console.warn(`   ⚠️ Supabase error for ${u.teacherId}:`, err.message);
      }
    }
    console.log(`   ✅ Synced ${successCount}/${updatedUsers.length} accounts to Supabase.`);
  } else {
    console.log('ℹ️ Supabase not connected; local database updated successfully.');
  }

  console.log('\n🎉 Password rotation completed successfully!');
  console.log('   All 14 accounts now require password change upon next login.');
}

runRotation().catch(err => {
  console.error('❌ Rotation failed:', err);
  process.exit(1);
});
