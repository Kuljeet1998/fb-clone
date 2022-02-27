import Koa from 'koa';
import cors from '@koa/cors';
import compress from 'koa-compress';
import KoaBody from 'koa-body';

// Config
import { SERVER } from './config/main';

//Import Routes
import { UserRoutes } from './routes/users';
import { PostRoutes } from './routes/posts';
import { CommentRoutes } from './routes/comments';
import { CommentReactionRoutes, PostReactionRoutes } from './routes/reactions'
import { UserListRoutes } from './routes/user-lists'

// INIT APP
const app = new Koa();

// Response compressor
app.use(compress({ br: false }));

// INIT MIDDLEWARES
app.use(cors());
app.use(
  KoaBody({
    includeUnparsed: true,
    multipart: true,
    parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  }),
);

//TODO: Auth

// INIT ROUTES
app.use(UserRoutes);
app.use(PostRoutes);
app.use(CommentRoutes);
app.use(CommentReactionRoutes);
app.use(PostReactionRoutes);
app.use(UserListRoutes)

// RUN SERVER
app.listen(SERVER.port);
console.log(`Server running on port ${SERVER.port}`);
