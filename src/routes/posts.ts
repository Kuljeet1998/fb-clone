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
  prefix: '/api/posts',
  methods: ['get', 'patch', 'post','delete'],
});

router.post('/', async (ctx) => {
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
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
        await MySQLConnection('post').insert(formData);
        const response = <Response>{ message: 'POST_ADDED', results: formData };
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
    const data = await MySQLConnection('post');
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

router.get('/:postId', async (ctx) => {
  const { postId } = ctx.params;
  try {
    const data = await MySQLConnection('post').where({id:postId});
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

router.put('/:postId', async (ctx) => {
  const { postId } = ctx.params;
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
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
        await MySQLConnection('post').update(formData).where({id:postId});
        const response = <Response>{ message: 'POST_UPDATED', results: formData };
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

router.delete('/:postId', async (ctx) => {
  const { postId } = ctx.params;
  try {
    await MySQLConnection('post').delete().where({ id: postId });
    const response = <Response>{ message: 'POST_DELETED' };
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

export const PostRoutes = router.routes();
