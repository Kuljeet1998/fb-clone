import Router from 'koa-router';
import { MySQLConnection } from '../config/main';
import { v4 as uuidv4 } from 'uuid';
import Joi from '@hapi/joi';

export interface Response {
  message: string;
  error?: any;
  results?: any;
}

const router = new Router({
  prefix: '/api/users',
  methods: ['get', 'patch', 'post'],
});

router.post('/', async (ctx) => {
  const formData = ctx.request.body;
  const schema = Joi.object({
    email: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().optional().allow(''),
  });
  try {
    await schema.validateAsync(formData);
    formData.id = uuidv4();
    await MySQLConnection('user').insert(formData);
    const response = <Response>{ message: 'USER_ADDED', results: formData };
    ctx.status = 200;
    ctx.body = response;
  } catch (error) {
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
    const data = await MySQLConnection('user');
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

router.get('/:userId', async (ctx) => {
  const { userId } = ctx.params;
  try {
    const data = await MySQLConnection('user').where({id:userId});
    ctx.status = 200;
    ctx.body = data[0];
  } catch (error) {
    ctx.status = 422;
    const response = <Response>{
      message: 'ERROR',
      error,
    };
    ctx.body = response;
  }
});

router.put('/:userId', async (ctx) => {
  const { userId } = ctx.params;
  const formData = ctx.request.body;
  const schema = Joi.object({
    email: Joi.string().required(),
    first_name: Joi.string().required(),
    last_name: Joi.string().optional().allow(''),
  });
  try {
    await schema.validateAsync(formData);
    await MySQLConnection('user').update(formData).where({id:userId});
    const response = <Response>{ message: 'USER_UPDATED', results: formData };
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

export const UserRoutes = router.routes();
