import express from "express";
import multer from 'multer';

import {SettingsController} from "../controllers/SettingsController.js";
import {TaskController} from "../controllers/TaskController.js";
import {PortalsController} from "../controllers/PortalsController.js";
import {ProxyController} from "../controllers/ProxyController.js";
import {ApiController} from "../controllers/ApiController.js";
import {AccountController} from "../controllers/AccountController.js";

import {Auth} from '../services/Auth.js';

const router = express.Router();
const upload = multer();

/**
 * SETTINGS
 */
let Settings = new SettingsController();
router.get('/settings/index', Auth, Settings.interfaceIndex);
router.get('/settings/add', Auth, Settings.interfaceAdd);
router.get('/settings/alias/:settings_id', Auth, Settings.interfaceEdit);

router.post('/settings/index', Auth, Settings.handlerIndex);
router.post('/settings/alias', Auth, Settings.handlerEdit);
router.post('/settings/add', Auth, Settings.handlerAdd);


/**
 * PORTALS
 */
let Portals = new PortalsController();
router.get('/portal/index', Auth, Portals.interfaceIndex);
router.get('/portal/add', Auth, Portals.interfaceAdd);
router.get('/portal/edit/:portal_id', Auth, Portals.interfaceEdit);
router.post('/portal/index', Auth, Portals.handlerIndex);
router.post('/portal/add', Auth, Portals.handlerAdd);
router.post('/portal/edit', Auth, Portals.handlerEdit);

/**
 * TASKS
 */
let Task = new TaskController();
router.get('/', Auth, Task.interfaceIndex);
router.get('/create_task', Auth, Task.interfaceAdd);
router.get('/statistics', Auth, Task.interfaceStatistics);
router.post('/tasks/restart', Auth, Task.handlerRestart);
router.post('/create_task', Auth, Task.handlerAdd);

/**
 * PROXY
 */
let Proxy = new ProxyController();
router.get('/proxy/index', Auth, Proxy.interfaceIndex);
router.get('/proxy/add', Auth, Proxy.interfaceAdd);
router.get('/proxy/edit/:proxy_id', Auth, Proxy.interfaceEdit);
router.post('/proxy/index', Auth, Proxy.handlerIndex);
router.post('/proxy/add', Auth, Proxy.handlerAdd);
router.post('/proxy/edit', Auth, Proxy.handlerEdit);


/**
 * ACCOUNT
 */
let Account = new AccountController();
router.get('/account/login', Account.interfaceIndex);
router.get('/account/logout', Account.interfaceLogout);
router.get('/account/edit', Auth, Account.interfaceEdit);
router.post('/account/login', Account.handlerIndex);
router.post('/account/changepassword', Auth, Account.handlerChangePassword);
router.post('/account/edit', Auth, Account.handlerEdit);


/**
 * API
 */
let Api = new ApiController();
router.get('/mainsystem/bot/get_file/', Api.handlerGetFile);
router.post('/mainsystem/api/order/:task_id/fail/', Api.handlerOrderFail);
router.post('/mainsystem/api/order/:task_id/success/', Api.handlerOrderSuccess);
router.get('/mainsystem/proxy/update/', Api.handlerProxyUpdate);

export default router;