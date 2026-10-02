-- ============================================================================
-- Supabase SQL Patch: Apply Password Rotation & Must Change Password
-- Description: Applies bcrypt hashes and enforces must_change_password on all 14 accounts
-- Compatible with schema variants (using primary key id and "teacherId")
-- ============================================================================

-- 1. Ensure security columns exist in public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "mustChangePassword" BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMPTZ;

-- 2. Apply bcrypt hashed passwords and force must_change_password flag
UPDATE public.users 
SET password = '$2b$10$w/VzK3H.8Frp.18aAVHMrOHojCMDdebTSl16CNrsn9Tdig/x0vbNO', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_2002' OR "teacherId" = '2002';

UPDATE public.users 
SET password = '$2b$10$QK7cC65k8XOvutYkLUhfOOGVj9KMd25C5SHKwTpjBSIAcDnjaEgGa', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_3001' OR "teacherId" = '3001';

UPDATE public.users 
SET password = '$2b$10$qoxNHYJ9ES.jMm802OrQcOc/D1nzouZenlDJ6CGVcHLjOwgLfxDUe', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_4001' OR "teacherId" = '4001';

UPDATE public.users 
SET password = '$2b$10$704ZqtI7sVmzemwDI085n.zn1j1PzNTokg9701qLfIQ0jMKFzviM2', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_10823' OR "teacherId" = '10823';

UPDATE public.users 
SET password = '$2b$10$O/wnXD0iwY5s8brqCNKy7.nzoKMaJ5WrNDwVc344hzDcehjwGPXLK', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_10797' OR "teacherId" = '10797';

UPDATE public.users 
SET password = '$2b$10$DPkFcTpUwMJIzpFIr7OphOjiz3iS5suufKnF6ouZPa5vj69ObD4Wq', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_admin' OR "teacherId" = 'admin';

UPDATE public.users 
SET password = '$2b$10$o0qi//HONd5mq2nCzHl3CuWBvmVpgQuvh5G8JymrhcgEA/jdmSg4K', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_1001' OR "teacherId" = '1001';

UPDATE public.users 
SET password = '$2b$10$frN9cQh2KXp3aUF6oaSCAuoocFO2TrFX.YT7dnj1i0AXcN.xP0YPm', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_1002' OR "teacherId" = '1002';

UPDATE public.users 
SET password = '$2b$10$LKbVkP1Np2rKYkG5PsKdOuyGoRhetqmyvfrkjphTv9.WAccIkD/0S', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_10746' OR "teacherId" = '10746';

UPDATE public.users 
SET password = '$2b$10$csnj49C6qh418EUl2JmgSeIzOcEuGG1BJeOsw2VOkZoIOx8jcEH5a', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_10568' OR "teacherId" = '10568';

UPDATE public.users 
SET password = '$2b$10$pMtUUavtvVXvd5go1sAZ1Ozm8xPr3i2D/UDphLB1izqp9SsRCo67K', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_10785' OR "teacherId" = '10785';

UPDATE public.users 
SET password = '$2b$10$wpWEv6OD1hElhGIinrJu3uN7CvVVe7BlgNnpB08noRpUIFeMQOnYe', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_10824' OR "teacherId" = '10824';

UPDATE public.users 
SET password = '$2b$10$O8L86M0XvX/KRk5XVQEcv.xRHff1cHAibN/8qM1hGLCAuXITqWJDm', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_2001' OR "teacherId" = '2001';

UPDATE public.users 
SET password = '$2b$10$AqltEdacjOSCZwUiHXxEJemzxmpHdn.xLsBgwa14MSEr.Cp0MMaTW', 
    must_change_password = true, 
    "mustChangePassword" = true, 
    password_changed_at = NOW() 
WHERE id = 'u_10572' OR "teacherId" = '10572';
