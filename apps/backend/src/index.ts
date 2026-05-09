import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import { cors } from '@elysiajs/cors';
import { logger } from "@rasla/logify";
import { guestController } from "@/modules/guest/GuestController";
import { roomController } from "@/modules/room/RoomController";
import { categoryController } from "@/modules/category/CategoryController";
import { documentTypeController } from "@/modules/document-type/DocumentTypeController";
import { bookingController } from "@/modules/booking/BookingController";
import { identityDocumentController } from "@/modules/identity-document/IdentityDocumentController";
import { folioController } from "@/modules/folio/FolioController";
import { serviceController } from "@/modules/service/ServiceController";
import { templateController } from "@/modules/template/TemplateController";
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
    .use(documentTypeController)
    .use(identityDocumentController)
    .use(guestController)
    .use(categoryController)
    .use(roomController)
    .use(bookingController)
    .use(folioController)
    .use(serviceController)
    .use(templateController)
    .use(cors({
        origin: 'http://localhost:5173',
    }))
    .listen({ port: 3000, hostname: '0.0.0.0' });

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
