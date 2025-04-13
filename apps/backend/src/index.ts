import { Elysia } from "elysia";
import swagger from "@elysiajs/swagger";
import { logger } from "@rasla/logify";
import { guest } from "./plugins/guestPlugin";
import { room } from "./plugins/roomPlugin";
import { category } from "./plugins/categoryPlugin";
import { documentType } from "./plugins/documentTypePlugin";
import { booking } from "./plugins/bookingPlugin";
import { identityDocument } from "./plugins/identityDocumentPlugin";

const app = new Elysia()
    .get("/", () => "Hello Elysia")
    .use(logger({ includeIp: true }))
    .use(swagger())
    .use(documentType)
    .use(identityDocument)
    .use(guest)
    .use(category)
    .use(room)
    .use(booking)
    .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
