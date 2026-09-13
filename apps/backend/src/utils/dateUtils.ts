export function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export function formatDateTime(d: Date): string {
    return d.toISOString();
}

export function parseDateOnly(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime()) || formatDate(date) !== value) {
        throw new Error(`Invalid date: ${value}`);
    }

    return date;
}
