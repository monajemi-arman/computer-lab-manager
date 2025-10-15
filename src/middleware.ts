import { stackMiddlewares } from "./middlewares/stack-middlewares";
import { validateToken } from "./middlewares/validate-token";

const middlewares = [validateToken];
export default stackMiddlewares(middlewares);

export const config = {
  matcher: [ '/api/user' , '/dashboard' ],
}