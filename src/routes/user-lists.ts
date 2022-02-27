import Router from 'koa-router';
import { MySQLConnection } from '../config/main';
import { v4 as uuidv4 } from 'uuid';
import Joi from '@hapi/joi';

//NOTE: Added provision of passing user_id in body which is not ideal
//It has to be fetched from the Auth header i.e. the logged in user

export interface Response {
  message: string;
  error?: any;
  results?: any;
}

const router = new Router({
  prefix: '/api/user-lists',
  methods: ['get', 'patch', 'post'],
});

//List of all users who have reacted to the given Post 
router.get('/post-reactions/:postId', async (ctx) => {
    const { postId } = ctx.params;
    try {
    //   const user = ctx.state ? ctx.state.user : undefined;
      const data = await MySQLConnection('user').innerJoin('post_reaction', 'user.id', 'post_reaction.user_id').where({post_id:postId});
      if (data.length==0){
        ctx.status = 400
        ctx.body = {error:'Data with the give ID does not exist'}
      }
      else{
        ctx.status = 200;
        ctx.body = data;
      }
    } catch (error) {
      ctx.status = 422;
      const response = <Response>{
        message: 'ERROR',
        error,
      };
      ctx.body = response;
    }
  });

//List of all users who have reacted to the given COMMENT 
router.get('/comment-reactions/:commentId', async (ctx) => {
    const { commentId } = ctx.params;
    try {
    //   const user = ctx.state ? ctx.state.user : undefined;
      const data = await MySQLConnection('user').innerJoin('comment_reaction', 'user.id', 'comment_reaction.user_id').where({post_id:commentId});
      if (data.length==0){
        ctx.status = 400
        ctx.body = {error:'Data with the give ID does not exist'}
      }
      else{
        ctx.status = 200;
        ctx.body = data;
      }
    } catch (error) {
      ctx.status = 422;
      const response = <Response>{
        message: 'ERROR',
        error,
      };
      ctx.body = response;
    }
  });

//List of all users who have commented on the given POST 
router.get('/comments/:postId', async (ctx) => {
    const { postId } = ctx.params;
    try {
      const data = await MySQLConnection('user').innerJoin('comment', 'user.id', 'comment.user_id').where({post_id:postId});
      if (data.length==0){
        ctx.status = 400
        ctx.body = {error:'Data with the give ID does not exist'}
      }
      else{
        ctx.status = 200;
        ctx.body = data;
      }
    } catch (error) {
      ctx.status = 422;
      const response = <Response>{
        message: 'ERROR',
        error,
      };
      ctx.body = response;
    }
  });

  export const UserListRoutes = router.routes();