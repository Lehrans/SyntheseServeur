import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import httpErrors from 'http-errors';

import Monsters from '../models/monster.js';

class MonsterServices {

    async create(monster, explorerId, explorationId) {
        monster.explorer = explorerId;
        monster.exploration = explorationId;
        return Monsters.create(monster);
    }

    transform(monster) {
        delete monster._id;
        delete monster.__v;
        
        return monster;
    }
}

export default new MonsterServices();