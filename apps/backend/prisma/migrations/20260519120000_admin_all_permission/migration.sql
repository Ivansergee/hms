DELETE FROM "RolePermission"
WHERE "roleId" = (
    SELECT "id"
    FROM "Role"
    WHERE "name" = 'Administrator'
);

INSERT INTO "RolePermission" ("roleId", "permissionKey")
SELECT "id", 'all'
FROM "Role"
WHERE "name" = 'Administrator'
ON CONFLICT DO NOTHING;
