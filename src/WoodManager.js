class WoodManager {
    // this cant be a map because the id changes in the networking stuff
    static woodList = [];

    static getWood(id) {
        for (let i = 0; i < WoodManager.woodList.length; i++) {
            if (WoodManager.woodList[i].id === id) {
                return WoodManager.woodList[i];
            }
        }

        return null;
    }

    static addWood(parentID, point) {
        const wood = new WoodObject(parentID, point);
        WoodManager.woodList.push(wood);
        return wood;
    }

    static removeWood(id) {
        for (let i = 0; i < WoodManager.woodList.length; i++) {
            if (WoodManager.woodList[i].id === id) {
                WoodManager.woodList.splice(i, 1);
                return;
            }
        }
    }

    static update() {
        for (let i = 0; i < WoodManager.woodList.length; i++) {
            WoodManager.woodList[i].update();
        }
    }

    static getNearbyUncarriedWood(point) {
        const allowedDistanceSquared = 20 * 20;

        for (let i = 0; i < WoodManager.woodList.length; i++) {
            if (WoodManager.woodList[i].playerID) {
                continue;
            }

            const position = WoodManager.woodList[i].position;
            if (position.distanceSquared(point) <= allowedDistanceSquared) {
                return WoodManager.woodList[i];
            }
        }

        return null;
    }

    static writePositionPackets() {
        const infoList = [];
        for (let i = 0; i < WoodManager.woodList.length; i++) {
            const wood = WoodManager.woodList[i];
            if (!wood.onRaft) {
                continue;
            }

            infoList.push(wood.id);
            infoList.push(wood.position.x);
            infoList.push(wood.position.y);
        }

        Packets.writeWoodPositionsPacket(infoList);
    }
}