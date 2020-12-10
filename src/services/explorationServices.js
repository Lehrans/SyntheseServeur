import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import httpErrors from 'http-errors';

import Explorations from '../models/exploration.js';

class ExplorationServices {

    async create(exploration) {
        return Explorations.create(exploration);
    }

    transform(exploration) {

        delete exploration._id;
        delete exploration.__v;

        return exploration;
    }

}

export default new ExplorationServices();