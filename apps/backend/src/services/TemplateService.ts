import fs from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import { $ } from "bun";

export class TemplateService {
    async getPreview(buffer: ArrayBuffer): Promise<Buffer> {
        const id = randomUUID();
        const tempDir = tmpdir();
        const docxPath = path.join(tempDir, `${id}.docx`);
        const pdfPath = path.join(tempDir, `${id}.pdf`);

        try {
            await fs.writeFile(docxPath, Buffer.from(buffer));
            await $`libreoffice --headless --convert-to pdf ${docxPath} --outdir ${tempDir}`;

            return await fs.readFile(pdfPath);
        } finally {
            fs.unlink(docxPath).catch(() => {});
            fs.unlink(pdfPath).catch(() => {});
        }
    }
}
