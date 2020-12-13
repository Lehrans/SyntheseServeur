import express from 'express';
import expressJWT from 'express-jwt';
import httpErrors from 'http-errors';

import monsterServices from '../services/mosnterServices.js';

const router = express.Router();
class MonstersRoutes {
    constructor() {
        // Routes restantes / à faire
        router.get('/:idMonster', this.getOneMonster) // Sélection d'un monstre
    }
    //##################################################################################
    async getOneMonster(req, res, next) {
        // Réponse hardcodé
        monster = {
            talents:["darkness", "life"],
            kernel:["Ve", "Ex", "A", "A", "B"],
            atlasNumber:1,
            name:"HELLO",
            health:20,
            damage:8,
            speed:2,
            critical:0.15,
            afinity:"earth",
            assets:"https://assets.andromia.science/monsters/1.png",
            hash:"ad6fa39869a926d58da7b377f8954b5c87f83f324287db78db42c1e806386010",
            href:null
        };
        return res.status(200).json(monster);
    }
}


new MonstersRoutes();

export default router;
