class SharkManager {
    static sharks = [];

    static nextSharkIndex = 1;

    static update() {
        if (Information.moon) {
            const desiredSharks = Math.max(3, Math.floor(Math.pow(EntityInformation.getEntityList().length, 0.7)));
            for (let i = SharkManager.sharks.length; i < desiredSharks; i++) {
                SharkManager.addShark(SharkManager.nextSharkIndex++, new Vec2(0, 0));
            }

            for (let i = SharkManager.sharks.length; i > desiredSharks; i--) {
                SharkManager.deleteShark(SharkManager.sharks[SharkManager.sharks.length - 1].id);
            }
        }

        for (let i = 0; i < SharkManager.sharks.length; i++) {
            SharkManager.sharks[i].update();
        }
    }

    static addShark(id, position) {
        const shark = SharkManager.getShark(id);
        if (shark) {
            return shark;
        }

        SharkManager.sharks.push(new Shark(id, position));
        return SharkManager.sharks[SharkManager.sharks.length - 1];
    }

    static deleteShark(id) {
        let shark = null;
        for (let i = 0; i < SharkManager.sharks.length; i++) {
            if (SharkManager.sharks[i].id === id) {
                shark = SharkManager.sharks[i];
                SharkManager.sharks.splice(i, 1);
                break;
            }
        }
        if (!shark) {
            return;
        }

        if (Information.moon) {
            Packets.writeSharkDeletePacket(shark.id);
        }

        shark.destroy();
    }

    static getShark(id) {
        for (let i = 0; i < SharkManager.sharks.length; i++) {
            if (SharkManager.sharks[i].id === id) {
                return SharkManager.sharks[i];
            }
        }

        return null;
    }

    static getSharkNearPoint(point) {
        for (let i = 0; i < SharkManager.sharks.length; i++) {
            if (SharkManager.sharks[i].position.distance(point) < 100) {
                return SharkManager.sharks[i];
            }
        }

        return null;
    }

    static sendPackets() {
        for (let i = 0; i < SharkManager.sharks.length; i++) {
            SharkManager.sharks[i].sendPackets();
        }
    }
}