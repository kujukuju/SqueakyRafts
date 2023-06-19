class EntityInformation {
    static _entitiesByID = {};
    static _clientStringID = null;
    static _clientID = null;

    static _lastResponseTimes = {};

    static getClientEntity() {
        return EntityInformation.getEntity(EntityInformation._clientStringID);
    }

    static getClientEntityID() {
        return EntityInformation._clientID;
    }

    static getClientEntityStringID() {
        return EntityInformation._clientStringID;
    }

    static setClientEntityID(id) {
        EntityInformation._clientID = id;
        EntityInformation._clientStringID = String(id);
    }

    static getEntityList() {
        return Object.values(EntityInformation._entitiesByID);
    }

    static getEntity(id) {
        return EntityInformation._entitiesByID[id] || null;
    }

    static hasEntity(id) {
        return !!EntityInformation._entitiesByID[id];
    }

    static addEntity(id, entity) {
        entity.id = id;
        EntityInformation._entitiesByID[id] = entity;
        return entity;
    }
    
    static silentlyRemoveEntity(id) {
        delete EntityInformation._entitiesByID[id];
    }

    static setResponseTime(id) {
        EntityInformation._lastResponseTimes[id] = Loop.time;
    }

    static getPlebEntityNearPosition(position) {
        for (const id in EntityInformation._entitiesByID) {
            const entity = EntityInformation._entitiesByID[id];

            if (entity instanceof MoonEntity) {
                continue;
            }

            const plebPosition = entity.getPosition();
            if (plebPosition.distance(position) < 30) {
                return entity;
            }
        }
    }

    static destroyUnresponsiveEntities() {
        const now = Loop.time;
        for (const id in EntityInformation._entitiesByID) {
            if (EntityInformation.getClientEntityStringID() === id) {
                continue;
            }

            const time = EntityInformation._lastResponseTimes[id] || 0;
            if (now - time > 8000) {
                EntityInformation.destroyEntity(id);
            }
        }
    }

    static writeVoice(length) {
        for (const id in EntityInformation._entitiesByID) {
            if (EntityInformation.getClientEntityStringID() === id) {
                continue;
            }

            EntityInformation._entitiesByID[id].writeVoice(length);
        }
    }

    static destroyEntity(id) {
        const entity = EntityInformation.getEntity(id);
        if (!entity) {
            return;
        }

        entity.destroy();
        
        EntityInformation.silentlyRemoveEntity(id);
    }

    static update() {
        for (const id in EntityInformation._entitiesByID) {
            EntityInformation._entitiesByID[id].update();
        }
    }

    static render() {
        for (const id in EntityInformation._entitiesByID) {
            EntityInformation._entitiesByID[id].render();
        }
    }
}