class RaftManager {
    static rafts = [];

    static update() {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            RaftManager.rafts[i].update();
        }
    }

    static getRaft(id) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            if (RaftManager.rafts[i].id === id) {
                return RaftManager.rafts[i];
            }
        }

        return null;
    }

    static addRaft(position, sendPackets) {
        const raft = new Raft(position);
        RaftManager.rafts.push(raft);

        if (sendPackets) {
            Packets.writeStartNewRaftPacket(raft.id, position);
        }

        return raft;
    }

    static getOnRaft(position) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            if (RaftManager.rafts[i].isOnRaft(position)) {
                return RaftManager.rafts[i];
            }
        }

        return null;
    }

    static getRandomRaftID() {
        if (RaftManager.rafts.length === 0) {
            return 0;
        }

        const index = Math.floor(Math.random() * RaftManager.rafts.length);
        return RaftManager.rafts[index].id;
    }

    static isOnRaft(position) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            if (RaftManager.rafts[i].isOnRaft(position)) {
                return true;
            }
        }

        return false;
    }

    static destroyInactiveRafts() {
        if (Information.moon) {
            for (let i = 0; i < RaftManager.rafts.length; i++) {
                if (Loop.time - RaftManager.rafts[i].interactTime > 30 * 60 * 1000) {
                    RaftManager.rafts[i].destroyRaft(true);
                    return;
                }
            }
        }
    }

    static removeRaft(id) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            if (RaftManager.rafts[i].id === id) {
                RaftManager.rafts.splice(i, 1);
                return;
            }
        }
    }

    static getNearbyPartOffsets(position) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            const potentialOffsets = RaftManager.rafts[i].getNearbyPartOffsets(position);
            if (potentialOffsets) {
                return [RaftManager.rafts[i], potentialOffsets];
            }
        }

        return null;
    }

    static getNearbyOccupiedOffsets(position) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            const potentialOffsets = RaftManager.rafts[i].getNearbyOccupiedOffsets(position);
            if (potentialOffsets) {
                return [RaftManager.rafts[i], potentialOffsets];
            }
        }

        return null;
    }
    
    // will return [raft, offset] if it found something
    static getNearbyAvailableOffsets(position) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            const potentialOffsets = RaftManager.rafts[i].getNearbyAvailableOffsets(position);
            if (potentialOffsets) {
                return [RaftManager.rafts[i], potentialOffsets];
            }
        }

        return null;
    }

    static getNearbyOccupiedButEmptyOffsets(position) {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            const potentialOffsets = RaftManager.rafts[i].getNearbyOccupiedButEmptyOffsets(position);
            if (potentialOffsets) {
                return [RaftManager.rafts[i], potentialOffsets];
            }
        }

        return null;
    }

    static writeRaftCreatePackets() {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            RaftManager.rafts[i].writeRaftCreatePackets();
        }
    }

    static writeSyncRaftPackets() {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            RaftManager.rafts[i].writeSyncPacket();
        }
    }

    static moveAwayFromIslands() {
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            RaftManager.rafts[i].moveAwayFromIslands();
        }
    }

    static getNearRaftStrength(position) {
        let strongest = 0;
        for (let i = 0; i < RaftManager.rafts.length; i++) {
            const strength = RaftManager.rafts[i].getNearRaftStrength(position);
            if (strength > strongest) {
                strongest = strength;
            }
        }

        return strongest;
    }
}