-- ========================================================
-- Update email approver untuk testing alur K3
-- Atas nama pegawai: Ahmad Yani (NIP: 1778258308)
-- ========================================================

-- Step 2: Officer K3 → rifan5708@gmail.com
UPDATE "User"
SET "emailPerusahaan" = 'rifan5708@gmail.com'
WHERE nip = 'OFF_K3';

-- Step 3: Asman K3L → firmanulloh038@gmail.com
UPDATE "User"
SET "emailPerusahaan" = 'firmanulloh038@gmail.com'
WHERE nip = 'ASM_K3';

-- Step 4: Manager Operasi → regandimasta.rd@gmail.com
UPDATE "User"
SET "emailPerusahaan" = 'regandimasta.rd@gmail.com'
WHERE nip = 'MGR_OPR';

-- Step 5: Branch Manager IPS → rifan5708@gmail.com
UPDATE "User"
SET "emailPerusahaan" = 'rifan5708@gmail.com'
WHERE nip = 'BM001';

-- Step 6: Admin → firmanulloh038@gmail.com
UPDATE "User"
SET "emailPerusahaan" = 'firmanulloh038@gmail.com'
WHERE nip = 'ADM001';

-- Verifikasi hasil update
SELECT nip, nama, role, "subBidang", "emailPerusahaan"
FROM "User"
WHERE nip IN ('OFF_K3', 'ASM_K3', 'MGR_OPR', 'BM001', 'ADM001', '1778258308')
ORDER BY 
  CASE nip 
    WHEN '1778258308' THEN 0
    WHEN 'OFF_K3' THEN 1
    WHEN 'ASM_K3' THEN 2
    WHEN 'MGR_OPR' THEN 3
    WHEN 'BM001' THEN 4
    WHEN 'ADM001' THEN 5
  END;
