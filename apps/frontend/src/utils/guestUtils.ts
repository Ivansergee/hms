import type { GuestCreate } from '@shared/types/guest';
import { isValidGuestData } from '@shared/validation/guest';

export type GuestDraft = Partial<Pick<
  GuestCreate,
  'firstName' | 'lastName' | 'parentName' | 'gender' | 'birthdate' | 'phone' | 'email' | 'citizenship'
>>;

const optionalText = (value?: string): string | undefined => value?.trim() || undefined;

export const toGuestCreatePayload = (guest: GuestDraft): GuestCreate => {
  if (!isValidGuestData(guest)) {
    throw new Error('Guest data is invalid');
  }

  const parentName = optionalText(guest.parentName);
  const phone = optionalText(guest.phone);
  const email = optionalText(guest.email);

  return {
    firstName: guest.firstName!.trim(),
    lastName: guest.lastName!.trim(),
    ...(parentName && { parentName }),
    ...(guest.gender && { gender: guest.gender }),
    ...(guest.birthdate && { birthdate: guest.birthdate }),
    ...(phone && { phone }),
    ...(email && { email }),
    ...(guest.citizenship && { citizenship: guest.citizenship }),
  };
};
