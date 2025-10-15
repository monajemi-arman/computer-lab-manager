import { verifyToken } from "@/lib/token/functions";
import { MiddlewareFactory } from "@/types/middleware";
import {
    NextFetchEvent,
    NextRequest,
    NextResponse
} from "next/server";

export const validateToken: MiddlewareFactory = (next) => {
    return async (request: NextRequest, _next: NextFetchEvent) => {
        const pathname = request.nextUrl.pathname;
        const url = new URL(`/login`, request.url);
        const token = request.cookies.get("token")?.value;

        if (["/dashboard"]?.some((path) => pathname.startsWith(path))) {
            if (!token) {
                return NextResponse.redirect(url);
            }
        }

        if (token && !verifyToken(token))
            return NextResponse.redirect(url);

        return next(request, _next);
        };
};