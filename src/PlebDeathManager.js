class PlebDeathManager {
    static deadPlebs = [];

    static update() {
        for (let i = 0; i < this.deadPlebs.length; i++) {
            this.deadPlebs[i].update();
        }
    }

    static getDeadPleb(id) {
        for (let i = 0; i < this.deadPlebs.length; i++) {
            if (this.deadPlebs[i].id === id) {
                return this.deadPlebs[i];
            }
        }

        return null;
    }

    static getNearbyUncarriedPleb(point) {
        const allowedDistanceSquared = 20 * 20;

        for (let i = 0; i < PlebDeathManager.deadPlebs.length; i++) {
            if (PlebDeathManager.deadPlebs[i].playerID) {
                continue;
            }

            const position = PlebDeathManager.deadPlebs[i].position;
            if (position.distanceSquared(point) <= allowedDistanceSquared) {
                return PlebDeathManager.deadPlebs[i];
            }
        }

        return null;
    }

    static getNearbyUneatenPleb(point) {
        const allowedDistanceSquared = 20 * 20;

        for (let i = 0; i < PlebDeathManager.deadPlebs.length; i++) {
            if (PlebDeathManager.deadPlebs[i].sprite.texture === DeadPleb.EATEN_TEXTURE) {
                continue;
            }

            const position = PlebDeathManager.deadPlebs[i].position;
            if (position.distanceSquared(point) <= allowedDistanceSquared) {
                return PlebDeathManager.deadPlebs[i];
            }
        }

        return null;
    }

    static addDeadPleb(id, position) {
        const pleb = new DeadPleb(id, position);
        this.deadPlebs.push(pleb);
        return pleb;
    }

    static removeDeadPleb(id) {
        for (let i = 0; i < PlebDeathManager.deadPlebs.length; i++) {
            if (PlebDeathManager.deadPlebs[i].id === id) {
                PlebDeathManager.deadPlebs.splice(i, 1);
                return;
            }
        }
    }

    static writePositionPackets() {
        const infoList = [];
        for (let i = 0; i < PlebDeathManager.deadPlebs.length; i++) {
            const pleb = PlebDeathManager.deadPlebs[i];
            if (!pleb.onRaft) {
                continue;
            }

            infoList.push(pleb.id);
            infoList.push(pleb.position.x);
            infoList.push(pleb.position.y);
        }

        Packets.writeDeadPlebPositionsPacket(infoList);
    }
}