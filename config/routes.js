import express from "express";
import multer from 'multer';

import {SettingsController} from "../controllers/SettingsController.js";
import {TaskController} from "../controllers/TaskController.js";
import {PortalsController} from "../controllers/PortalsController.js";
import {ProxyController} from "../controllers/ProxyController.js";
import {ApiController} from "../controllers/ApiController.js";
import {AccountController} from "../controllers/AccountController.js";

const router = express.Router();
const upload = multer();

/**
 * SETTINGS
 */
let Settings = new SettingsController();
router.get('/settings/index', Settings.interfaceIndex);
router.get('/settings/add', Settings.interfaceAdd);
router.get('/settings/alias/:settings_id', Settings.interfaceEdit);

router.post('/settings/index', Settings.handlerIndex);
router.post('/settings/alias', Settings.handlerEdit);
router.post('/settings/add', Settings.handlerAdd);


/**
 * PORTALS
 */
let Portals = new PortalsController();
router.get('/portal/index', Portals.interfaceIndex);
router.get('/portal/add', Portals.interfaceAdd);
router.get('/portal/edit/:portal_id', Portals.interfaceEdit);
router.post('/portal/index', Portals.handlerIndex);
router.post('/portal/add', Portals.handlerAdd);
router.post('/portal/edit', Portals.handlerEdit);

/**
 * TASKS
 */
let Task = new TaskController();
router.get('/', Task.interfaceIndex);
router.get('/create_task', Task.interfaceAdd);
router.get('/statistics', Task.interfaceStatistics);
router.post('/tasks/restart', Task.handlerRestart);
router.post('/create_task', Task.handlerAdd);

/**
 * PROXY
 */
let Proxy = new ProxyController();
router.get('/proxy/index', Proxy.interfaceIndex);
router.get('/proxy/add', Proxy.interfaceAdd);
router.get('/proxy/edit/:proxy_id', Proxy.interfaceEdit);
router.post('/proxy/index', Proxy.handlerIndex);
router.post('/proxy/add', Proxy.handlerAdd);
router.post('/proxy/edit', Proxy.handlerEdit);


/**
 * ACCOUNT
 */
let Account = new AccountController();
router.get('/account/login', Account.interfaceIndex);
/*router.post('/account/login', Account.handlerIndex);*/


/**
 * API
 */
let Api = new ApiController();
router.get('/mainsystem/bot/get_file/', Api.handlerGetFile);
router.post('/mainsystem/api/order/:task_id/fail/', Api.handlerOrderFail);
router.post('/mainsystem/api/order/:task_id/success/', Api.handlerOrderSuccess);
router.get('/mainsystem/proxy/update/', Api.handlerProxyUpdate);

export default router;