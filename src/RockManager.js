class RockManager {
    // this cant be a map because the id changes in the networking stuff
    static rockList = [];

    static getRock(id) {
        for (let i = 0; i < RockManager.rockList.length; i++) {
            if (RockManager.rockList[i].id === id) {
                return RockManager.rockList[i];
            }
        }

        return null;
    }

    static addRock(parentID, point) {
        const rock = new RockObject(parentID, point);
        RockManager.rockList.push(rock);
        return rock;
    }

    static removeRock(id) {
        for (let i = 0; i < RockManager.rockList.length; i++) {
            if (RockManager.rockList[i].id === id) {
                RockManager.rockList.splice(i, 1);
                return;
            }
        }
    }

    static update() {
        for (let i = 0; i < RockManager.rockList.length; i++) {
            RockManager.rockList[i].update();
        }
    }

    static getNearbyUncarriedRock(point) {
        const allowedDistanceSquared = 20 * 20;

        for (let i = 0; i < RockManager.rockList.length; i++) {
            if (RockManager.rockList[i].playerID) {
                continue;
            }

            const position = RockManager.rockList[i].position;
            if (position.distanceSquared(point) <= allowedDistanceSquared) {
                return RockManager.rockList[i];
            }
        }

        return null;
    }

    static writePositionPackets() {
        const infoList = [];
        for (let i = 0; i < RockManager.rockList.length; i++) {
            const rock = RockManager.rockList[i];
            if (!rock.onRaft) {
                continue;
            }

            infoList.push(rock.id);
            infoList.push(rock.position.x);
            infoList.push(rock.position.y);
        }

        Packets.writeRockPositionsPacket(infoList);
    }
}