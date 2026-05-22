INSERT INTO "RolePermission" ("roleId", "permissionKey")
SELECT
    "roleId",
    CASE "permissionKey"
        WHEN 'user:manage' THEN 'user:edit'
        WHEN 'role:manage' THEN 'role:edit'
        WHEN 'guest:create' THEN 'guest:edit'
        WHEN 'guest:update' THEN 'guest:edit'
        WHEN 'guest:delete' THEN 'guest:edit'
        WHEN 'booking:create' THEN 'booking:edit'
        WHEN 'booking:update' THEN 'booking:edit'
        WHEN 'booking:cancel' THEN 'booking:edit'
        WHEN 'room:update' THEN 'room:edit'
        WHEN 'room:status:update' THEN 'room:edit'
        WHEN 'category:manage' THEN 'category:edit'
        WHEN 'document-type:manage' THEN 'document-type:edit'
        WHEN 'identity-document:manage' THEN 'identity-document:edit'
        WHEN 'folio:update' THEN 'folio:edit'
        WHEN 'payment:create' THEN 'folio:edit'
        WHEN 'service:manage' THEN 'service:edit'
        WHEN 'template:manage' THEN 'template:edit'
        ELSE "permissionKey"
    END
FROM "RolePermission"
ON CONFLICT DO NOTHING;

DELETE FROM "RolePermission"
WHERE "permissionKey" NOT IN (
    'all',
    'user:read',
    'user:edit',
    'role:read',
    'role:edit',
    'guest:read',
    'guest:edit',
    'booking:read',
    'booking:edit',
    'room:read',
    'room:edit',
    'category:read',
    'category:edit',
    'document-type:read',
    'document-type:edit',
    'identity-document:read',
    'identity-document:edit',
    'folio:read',
    'folio:edit',
    'service:read',
    'service:edit',
    'template:read',
    'template:edit'
);
