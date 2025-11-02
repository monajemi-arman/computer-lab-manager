import { stackMiddlewares } from "./middlewares/stack-middlewares";
import { restrictPaths } from "./middlewares/restrict-paths";

const middlewares = [restrictPaths];
export default stackMiddlewares(middlewares);

export const config = {
  matcher: [ '/api/user' , '/dashboard' ],
}