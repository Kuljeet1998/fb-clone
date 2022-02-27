import Router from 'koa-router';
import { MySQLConnection } from '../config/main';
import { v4 as uuidv4 } from 'uuid';
import Joi from '@hapi/joi';

//TODO: user_id -> createdBy
//NOTE: Added provision of passing user_id in body which is not ideal
//It has to be fetched from the Auth header i.e. the logged in user

export interface Response {
  message: string;
  error?: any;
  results?: any;
}

const router = new Router({
  prefix: '/api/comments',
  methods: ['get', 'patch', 'post'],
});

router.post('/', async (ctx) => {
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    text: Joi.string().required(),
    post_id: Joi.string().required(), //TODO: post_id -> postID
    user_id: Joi.string().optional(),
  });
  try {
    await schema.validateAsync(formData);
    if (user === undefined && 'user_id' in formData === false) {
        ctx.status = 500
        ctx.body = <Response>{error:'user should be logged in or user_id should be provided in body'}
    }
    else{
        if(user !== undefined){
            formData.user_id =  user.id
        }
        formData.id = uuidv4();
        await MySQLConnection('comment').insert(formData);
        const response = <Response>{ message: 'COMMENT_ADDED', results: formData };
        ctx.status = 200;
        ctx.body = response;
    }
  } catch (error) {
    console.log(error)
    ctx.status = 500;
    const response = <Response>{
      message: 'ERROR',
      error,
    };
    ctx.body = response;
  }
});

router.get('/', async (ctx) => {
  try {
    const data = await MySQLConnection('comment');
    const response = <Response>{ results: data };
    ctx.status = 200;
    ctx.body = response;
  } catch (error) {
    ctx.status = 422;
    const response = <Response>{
      message: 'ERROR',
      error,
    };
    ctx.body = response;
  }
});

router.get('/:commentId', async (ctx) => {
  const { commentId } = ctx.params;
  try {
    const data = await MySQLConnection('comment').where({id:commentId});
    if (data.length==0){
      ctx.status = 400
      ctx.body = {error:'Data with the give ID does not exist'}
    }
    else{
      ctx.status = 200;
      ctx.body = data[0];
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

router.put('/:commentId', async (ctx) => {
  const { commentId } = ctx.params;
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    text: Joi.string().required(),
    post_id: Joi.string().required(), //TODO: post_id -> postID
    user_id: Joi.string().optional(),
  });
  try {
    await schema.validateAsync(formData);
    if (user === undefined && 'user_id' in formData === false) {
        ctx.status = 500
        ctx.body = <Response>{error:'user should be logged in or user_id should be provided in body'}
    }
    else{
        if(user !== undefined){
            formData.user_id =  user.id
        }
        await MySQLConnection('comment').update(formData).where({id:commentId});
        const response = <Response>{ message: 'COMMENT_UPDATED', results: formData };
        ctx.status = 200;
        ctx.body = response;
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

router.delete('/:commentId', async (ctx) => {
  const { commentId } = ctx.params;
  try {
    await MySQLConnection('comment').delete().where({ id: commentId });
    const response = <Response>{ message: 'COMMENT_DELETED' };
    ctx.status = 200;
    ctx.body = response;
  } catch (error) {
    ctx.status = 422;
    const response = <Response>{
      message: 'ERROR',
      error,
    };
    ctx.body = response;
  }
});

export const CommentRoutes = router.routes();
