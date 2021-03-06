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
        delete exploration.explorer;
        
        if(exploration.vault != undefined) {
            delete exploration.vault._id;
            exploration.vault.elements.forEach(e => {
                delete e._id;
                
            });
        }
        return exploration;
    }

    async retrieveById(explorationId) {
        return await Explorations.findById(explorationId);
    }

    async retrieveExplorations(explorerId) {
        let explorations = Explorations.find({explorer: explorerId})
        return explorations;

    }

}

export default new ExplorationServices();