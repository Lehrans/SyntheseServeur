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

    async retrieveMonsters(explorer) {
        let monsters = Monsters.find({explorer: explorer})
        return monsters;
    }

}

export default new MonsterServices();