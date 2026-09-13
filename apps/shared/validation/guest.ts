import { COUNTRY_CODES, type CountryCode } from '../constants/countryCodes';
import type { GuestCreate } from '../types/guest';

export const GUEST_NAME_PATTERN = '\\S';
export const GUEST_EMAIL_PATTERN = '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$';
export const COUNTRY_CODE_PATTERN = `^(?:${COUNTRY_CODES.join('|')})$`;

const guestEmailRegex = new RegExp(GUEST_EMAIL_PATTERN);
const countryCodes = new Set<string>(COUNTRY_CODES);

type GuestValidationData = Pick<GuestCreate, 'firstName' | 'lastName' | 'email'>;

export const isValidGuestEmail = (email?: string): boolean => {
    const value = email?.trim();
    return !value || guestEmailRegex.test(value);
};

export const isValidGuestData = (guest: Partial<GuestValidationData>): boolean => (
    !!guest.firstName?.trim()
    && !!guest.lastName?.trim()
    && isValidGuestEmail(guest.email)
);

export const isCountryCode = (value: string): value is CountryCode => countryCodes.has(value);
