import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';
import { logger } from "@rasla/logify";
import { guest } from "@/plugins/guestPlugin";
import { room } from "@/plugins/roomPlugin";
import { category } from "@/plugins/categoryPlugin";
import { documentType } from "@/plugins/documentTypePlugin";
import { booking } from "@/plugins/bookingPlugin";
import { identityDocument } from "@/plugins/identityDocumentPlugin";
import { folio } from "@/plugins/folioPlugin";
import { service } from "@/plugins/servicePlugin";
import { template } from "@/plugins/templatePlugin";
import path from "path";
import staticPlugin from "@elysiajs/static";

const app = new Elysia()
    .use(logger({ includeIp: true }))
    .use(swagger())
    .use(
        staticPlugin({
            prefix: '/uploads',
            assets: path.resolve('uploads'),
        })
    )
    .use(documentType)
    .use(identityDocument)
    .use(guest)
    .use(category)
    .use(room)
    .use(booking)
    .use(folio)
    .use(service)
    .use(template)
    .use(cors({
        origin: 'http://localhost:5173',
    }))
    .listen({ port: 3000, hostname: '0.0.0.0' });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
