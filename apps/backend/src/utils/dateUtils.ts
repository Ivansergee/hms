export function formatDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

export function formatDateTime(d: Date): string {
    return d.toISOString();
}