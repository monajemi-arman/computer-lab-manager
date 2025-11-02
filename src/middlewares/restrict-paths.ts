import { restrictedPaths } from "@/lib/config/routes";
import { MiddlewareFactory } from "@/types/middleware";
import {
    NextFetchEvent,
    NextRequest,
} from "next/server";
import { auth } from "@/auth";

export const restrictPaths: MiddlewareFactory = (next) => {
    return async (request: NextRequest, _next: NextFetchEvent) => {

        const nextUrl = request.nextUrl;
        const isOnRestrictedPath = restrictedPaths.some((path: string) =>
            nextUrl.pathname.startsWith(path)
        );

        if (isOnRestrictedPath) {
            const session = await auth();
            if (!session?.user.role) {
                return Response.redirect(new URL('/login', nextUrl));
            }
        }

        return next(request, _next);
    };
};