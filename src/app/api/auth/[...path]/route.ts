import { authServer } from "@/lib/auth-server";

export const { GET, POST, PUT, PATCH, DELETE } = authServer.handler();
