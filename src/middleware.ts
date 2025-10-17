import { stackMiddlewares } from "./middlewares/stack-middlewares";
import { withAuthWrapped } from "./middlewares/withAuth";

const middlewares = [withAuthWrapped];
export default stackMiddlewares(middlewares);

export const config = {
  matcher: [ '/api/user' , '/dashboard' ],
}