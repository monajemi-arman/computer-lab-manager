import { stackMiddlewares } from "./middlewares/stack-middlewares";
import { withUser } from "./middlewares/with-auth";

const middlewares = [withUser];
export default stackMiddlewares(middlewares);

export const config = {
  matcher: [ '/api/user' , '/dashboard' ],
}