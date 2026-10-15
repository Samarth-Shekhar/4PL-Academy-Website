import { dialect } from '../config.js';
import * as postgres from './index.js';
import * as mysql from '../mysql/index.js';

const selected = dialect === 'mysql' ? mysql : postgres;
export const { contentTable, leadsTable, adminsTable, sessionsTable } = selected;
