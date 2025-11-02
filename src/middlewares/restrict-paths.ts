import { MiddlewareFactory } from "@/types/middleware";
import {
    NextFetchEvent,
    NextRequest,
} from "next/server";
import { getIsAdmin, getSession } from "@/app/actions";
import { checkAccessPath } from "@/lib/routes";

export const restrictPaths: MiddlewareFactory = (next) => {
    return async (request: NextRequest, _next: NextFetchEvent) => {

        const nextUrl = request.nextUrl;

        const isAdmin = await getIsAdmin();
        const session = await getSession()
        const isLoggedIn = !!session?.user.role;
        const hasAccessPath = checkAccessPath(nextUrl.pathname, isLoggedIn, isAdmin);
        if (!hasAccessPath) {
            return Response.redirect(new URL('/login', nextUrl));
        }

        return next(request, _next);
    };
};