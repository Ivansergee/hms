import { Static, t } from 'elysia'
import { Gender } from '@shared/enums/Gender';
import { enumToTypebox } from '@/utils/enumUtils';
import {
    COUNTRY_CODE_PATTERN,
    GUEST_EMAIL_PATTERN,
    GUEST_NAME_PATTERN,
} from '@shared/validation/guest';
import type { CountryCode } from '@shared/constants/countryCodes';
import type { TString } from '@sinclair/typebox';

const countryCode = t.String({ pattern: COUNTRY_CODE_PATTERN }) as TString & {
    static: CountryCode;
};

const create = t.Object({
    firstName: t.String({ minLength: 1, pattern: GUEST_NAME_PATTERN }),
    lastName: t.String({ minLength: 1, pattern: GUEST_NAME_PATTERN }),
    parentName: t.Optional(t.String()),
    gender: t.Optional(t.Enum(enumToTypebox(Gender))),
    birthdate: t.Optional(t.String({ format: 'date' })),
    phone: t.Optional(t.String()),
    email: t.Optional(t.String({ pattern: GUEST_EMAIL_PATTERN })),
    citizenship: t.Optional(countryCode),
}, { additionalProperties: false });

export const guestModel = {
    create,
    update: t.Partial(create),
    search: t.Object({
        q: t.Optional(t.String()),
    }),
    params: t.Object({
        id: t.Numeric(),
    }),
};

export type GuestCreateDTO = Static<typeof guestModel.create>;
export type GuestUpdateDTO = Static<typeof guestModel.update>;
