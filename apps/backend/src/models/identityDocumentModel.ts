import { Static, t } from 'elysia'

const create = t.Object({
    typeId: t.Integer(),
    firstName: t.String(),
    lastName: t.String(),
    parentName: t.Optional(t.String()),
    birthdate: t.Date(),
    number: t.String(),
    issuedBy: t.Optional(t.String()),
    issuedByCode: t.Optional(t.String()),
    issuedAt: t.Optional(t.Date()),
    expiresAt: t.Optional(t.Date()),
});

export const identityDocumentModel = {
    create,
    update: t.Partial(create),
    params: t.Object({
        id: t.Numeric(),
    }),
};

export type IdentityDocumentCreateDTO = Static<typeof identityDocumentModel.create>
export type IdentityDocumentUpdateDTO = Static<typeof identityDocumentModel.update>
