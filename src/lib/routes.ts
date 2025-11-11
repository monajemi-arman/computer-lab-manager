const userRestrictedPaths: string[] = ['/dashboard'];
const adminRestrictedPaths: string[] = ['/api/computer', '/api/playbook'];

const userRestrictedPathsRegex = ["^/api/user/[^/]+$"]
    .map((x) => new RegExp(x));
const adminRestrictedPathsRegex = ["^/api/user$"]
    .map((x) => new RegExp(x));

export const checkAccessPath = (currentPath: string, isLoggedIn: boolean, isAdmin: boolean) => {
    for (const pathname of userRestrictedPaths) {
        if (currentPath.startsWith(pathname) && !isLoggedIn) {
            return false;
        }
    }

    for (const pathname of adminRestrictedPaths) {
        if (currentPath.startsWith(pathname) && !isAdmin) {
            return false;
        }
    }

    for (const regexPath of userRestrictedPathsRegex) {
        if (regexPath.test(currentPath) && !isLoggedIn) {
            return false;
        }
    }

    for (const regexPath of adminRestrictedPathsRegex) {
        if (regexPath.test(currentPath) && !isAdmin) {
            return false;
        }
    }

    return true;
}