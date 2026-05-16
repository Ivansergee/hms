export const permissions = {
    USER_READ: 'user:read',
    USER_MANAGE: 'user:manage',

    ROLE_READ: 'role:read',
    ROLE_MANAGE: 'role:manage',

    GUEST_READ: 'guest:read',
    GUEST_CREATE: 'guest:create',
    GUEST_UPDATE: 'guest:update',
    GUEST_DELETE: 'guest:delete',

    BOOKING_READ: 'booking:read',
    BOOKING_CREATE: 'booking:create',
    BOOKING_UPDATE: 'booking:update',
    BOOKING_CANCEL: 'booking:cancel',

    ROOM_READ: 'room:read',
    ROOM_UPDATE: 'room:update',
    ROOM_STATUS_UPDATE: 'room:status:update',

    CATEGORY_READ: 'category:read',
    CATEGORY_MANAGE: 'category:manage',

    DOCUMENT_TYPE_READ: 'document-type:read',
    DOCUMENT_TYPE_MANAGE: 'document-type:manage',

    IDENTITY_DOCUMENT_READ: 'identity-document:read',
    IDENTITY_DOCUMENT_MANAGE: 'identity-document:manage',

    FOLIO_READ: 'folio:read',
    FOLIO_UPDATE: 'folio:update',
    PAYMENT_CREATE: 'payment:create',

    SERVICE_READ: 'service:read',
    SERVICE_MANAGE: 'service:manage',

    TEMPLATE_READ: 'template:read',
    TEMPLATE_MANAGE: 'template:manage',
} as const;

export type Permission = (typeof permissions)[keyof typeof permissions];

export const permissionValues = Object.values(permissions);

export const adminPermissions = permissionValues;
