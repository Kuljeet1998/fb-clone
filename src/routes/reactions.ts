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

const postReactionRouter = new Router({
  prefix: '/api/post-reactions',
  methods: ['get', 'patch', 'post'],
});

postReactionRouter.post('/', async (ctx) => {
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    type: Joi.string().required(),
    post_id: Joi.string().required(),
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
        //Check if user has already reacted to the same POST
        const checkReaction =  await MySQLConnection('post_reaction').where({
          user_id:formData.user_id,
          post_id:formData.post_id
        });
        if(checkReaction.length===0){
          formData.id = uuidv4();
          await MySQLConnection('post_reaction').insert(formData);
          const response = <Response>{ message: 'REACTED_ON_POST', results: formData };
          ctx.status = 200;
          ctx.body = response;
        }
        else{
          const response = <Response>{ 
            message: 'ERROR',
            error: 'This user has already reacted to the post' 
          };
          ctx.status = 500;
          ctx.body = response;
        }
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

postReactionRouter.get('/', async (ctx) => {
  try {
    const data = await MySQLConnection('post_reaction');
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

postReactionRouter.get('/:postReactionId', async (ctx) => {
  const { postReactionId } = ctx.params;
  try {
    const data = await MySQLConnection('post_reaction').where({id:postReactionId});
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

postReactionRouter.put('/:postReactionId', async (ctx) => {
  const { postReactionId } = ctx.params;
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    type: Joi.string().required(),
    post_id: Joi.string().required(),
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
        await MySQLConnection('post_reaction').update(formData).where({id:postReactionId});
        const response = <Response>{ message: 'REACTION_ON_POST_UPDATED', results: formData };
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

postReactionRouter.delete('/:postReactionId', async (ctx) => {
  const { postReactionId } = ctx.params;
  try {
    await MySQLConnection('post_reaction').delete().where({ id: postReactionId });
    const response = <Response>{ message: 'REACTION_ON_POST_DELETED' };
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

export const PostReactionRoutes = postReactionRouter.routes();


//Comment reactions 
export interface Response {
  message: string;
  error?: any;
  results?: any;
}

const commentReactionRouter = new Router({
  prefix: '/api/comment-reactions',
  methods: ['get', 'patch', 'post'],
});

commentReactionRouter.post('/', async (ctx) => {
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    type: Joi.string().required(),
    comment_id: Joi.string().required(),
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
        //Check if user has already reacted to the same COMMENT
        const checkReaction =  await MySQLConnection('comment_reaction').where({
          user_id:formData.user_id,
          comment_id:formData.comment_id
        });
        if(checkReaction.length===0){
          formData.id = uuidv4();
          await MySQLConnection('comment_reaction').insert(formData);
          const response = <Response>{ message: 'REACTED_ON_COMMENT', results: formData };
          ctx.status = 200;
          ctx.body = response;
        }
        else{
          const response = <Response>{ 
            message: 'ERROR',
            error: 'This user has already reacted to the comment' 
          };
          ctx.status = 500;
          ctx.body = response;
        }
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

commentReactionRouter.get('/', async (ctx) => {
  try {
    const data = await MySQLConnection('comment_reaction');
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

commentReactionRouter.get('/:commentReactionId', async (ctx) => {
  const { commentReactionId } = ctx.params;
  try {
    const data = await MySQLConnection('comment_reaction').where({id:commentReactionId});
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

commentReactionRouter.put('/:commentReactionId', async (ctx) => {
  const { commentReactionId } = ctx.params;
  const formData = ctx.request.body;
  const user = ctx.state ? ctx.state.user : undefined;
  const schema = Joi.object({
    type: Joi.string().required(),
    comment_id: Joi.string().required(),
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
        await MySQLConnection('comment_reaction').update(formData).where({id:commentReactionId});
        const response = <Response>{ message: 'REACTION_ON_COMMENT_UPDATED', results: formData };
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

commentReactionRouter.delete('/:commentReactionId', async (ctx) => {
  const { commentReactionId } = ctx.params;
  try {
    await MySQLConnection('comment_reaction').delete().where({ id: commentReactionId });
    const response = <Response>{ message: 'REACTION_ON_COMMENT_DELETED' };
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

export const CommentReactionRoutes = commentReactionRouter.routes();