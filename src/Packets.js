class Packets {
    static PACKET_MOON = 0;
    static PACKET_POSITION_VELOCITY = 1;
    static PACKET_VOICE = 2;
    static PACKET_PUNCHING = 3;
    static PACKET_SPAWN_WOOD = 4;
    static PACKET_CARRY_WOOD = 5;
    static PACKET_DROP_WOOD = 6;
    static PACKET_SPAWN_ROCK = 7;
    static PACKET_CARRY_ROCK = 8;
    static PACKET_DROP_ROCK = 9;
    static PACKET_ADD_RAFT_PARTS = 10;
    static PACKET_BUILD_RAFT_PART = 11;
    static PACKET_DESTROY_RAFT_PART = 12;
    static PACKET_START_NEW_RAFT = 13;
    static PACKET_CONSUME_WOOD = 14;
    static PACKET_CONSUME_STONE = 15;
    static PACKET_SYNC_RAFT = 16;
    static PACKET_BUILD_RAFT_PADDLE = 17;
    static PACKET_INTERACTION = 18;
    static PACKET_CLEAR_INTERACTION = 19;
    static PACKET_WOOD_POSITIONS = 20;
    static PACKET_ROCK_POSITIONS = 21;
    static PACKET_HOLDING_PLEB = 22;
    static PACKET_RELEASE_PLEB = 23;
    static PACKET_SHARK_POSITION_VELOCITY = 24;
    static PACKET_BUILD_RAFT_HARPOON = 25;
    static PACKET_LOAD_HARPOON = 26;
    static PACKET_SET_HARPOON_DIRECTION = 27;
    static PACKET_FIRE_HARPOON = 28;
    static PACKET_BIT = 29;
    static PACKET_MOON_DOWN = 30;
    static PACKET_AIMING = 31;
    static PACKET_AIMING_DIRECTION = 32;
    static PACKET_FIRED_BULLET = 33;
    static PACKET_CARRY_DEAD_PLEB = 34;
    static PACKET_CONSUME_DEAD_PLEB = 35;
    static PACKET_EAT_DEAD_PLEB = 36;
    static PACKET_DROP_DEAD_PLEB = 37;
    static PACKET_DEAD_PLEB_POSITIONS = 38;
    static PACKET_VOICE_CHAT_ENABLED = 39;
    static PACKET_SET_SPAWN_ISLAND = 40;
    static PACKET_EMPTY = 41;
    static PACKET_SHARK_DELETE = 42;
    static PACKET_USERNAME = 43;
    static PACKET_DESTROY_RAFT = 44;
    static PACKET_CHAT = 45;

    static bytes = [];

    static signedByteBuffer = new Int8Array(BinaryHelper._buffer);

    static clear() {
        Packets.bytes.length = 0;
    }

    static writeMoonPacket(id, moon) {
        Packets.bytes.push(Packets.PACKET_MOON);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
        Packets.bytes.push(moon ? 1 : 0);
    }

    static writePositionVelocityPacket(id, position, velocity) {
        Packets.bytes.push(Packets.PACKET_POSITION_VELOCITY);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.y, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocity.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocity.y, Packets.bytes, Packets.bytes.length);
    }

    static writeVoicePacket(id, floats) {
        Packets.bytes.push(Packets.PACKET_VOICE);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);

        BinaryHelper.writeInt(floats.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < floats.length; i++) {
            BinaryHelper.writeFloat(floats[i], Packets.bytes, Packets.bytes.length);
        }
    }

    static writePunchingPacket(id, punching) {
        Packets.bytes.push(Packets.PACKET_PUNCHING);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
        Packets.bytes.push(punching ? 1 : 0);
    }

    static writeSpawnWoodPacket(treeID, woodID, playerID, angle, speed, heightSpeed) {
        Packets.bytes.push(Packets.PACKET_SPAWN_WOOD);
        BinaryHelper.writeInt(treeID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(woodID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(playerID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(angle, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(speed, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(heightSpeed, Packets.bytes, Packets.bytes.length);
    }

    static writeCarryWoodPacket(woodID, playerID) {
        Packets.bytes.push(Packets.PACKET_CARRY_WOOD);
        BinaryHelper.writeInt(woodID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(playerID, Packets.bytes, Packets.bytes.length);
    }

    static writeDropWoodPacket(woodID, position) {
        Packets.bytes.push(Packets.PACKET_DROP_WOOD);
        BinaryHelper.writeInt(woodID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.y, Packets.bytes, Packets.bytes.length);
    }

    static writeSpawnRockPacket(boulderID, rockID, playerID, angle, speed, heightSpeed) {
        Packets.bytes.push(Packets.PACKET_SPAWN_ROCK);
        BinaryHelper.writeInt(boulderID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(rockID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(playerID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(angle, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(speed, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(heightSpeed, Packets.bytes, Packets.bytes.length);
    }

    static writeCarryRockPacket(rockID, playerID) {
        Packets.bytes.push(Packets.PACKET_CARRY_ROCK);
        BinaryHelper.writeInt(rockID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(playerID, Packets.bytes, Packets.bytes.length);
    }

    static writeDropRockPacket(rockID, position) {
        Packets.bytes.push(Packets.PACKET_DROP_ROCK);
        BinaryHelper.writeInt(rockID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.y, Packets.bytes, Packets.bytes.length);
    }

    static writeAddRaftPartsPacket(raftID, raftPosition, partOffsets, paddleOffsets, harpoonOffsets) {
        Packets.bytes.push(Packets.PACKET_ADD_RAFT_PARTS);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(raftPosition.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(raftPosition.y, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(partOffsets.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < partOffsets.length; i++) {
            writeSignedByte(partOffsets[i], Packets.bytes, Packets.bytes.length);
        }
        BinaryHelper.writeInt(paddleOffsets.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < paddleOffsets.length; i++) {
            writeSignedByte(paddleOffsets[i], Packets.bytes, Packets.bytes.length);
        }
        BinaryHelper.writeInt(harpoonOffsets.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < harpoonOffsets.length; i++) {
            writeSignedByte(harpoonOffsets[i], Packets.bytes, Packets.bytes.length);
        }
    }

    static writeBuildRaftPartPacket(raftID, offsetX, offsetY) {
        Packets.bytes.push(Packets.PACKET_BUILD_RAFT_PART);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        writeSignedByte(offsetX, Packets.bytes, Packets.bytes.length);
        writeSignedByte(offsetY, Packets.bytes, Packets.bytes.length);
    }

    static writeDestroyRaftPartPacket(raftID, offsetX, offsetY) {
        Packets.bytes.push(Packets.PACKET_DESTROY_RAFT_PART);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        writeSignedByte(offsetX, Packets.bytes, Packets.bytes.length);
        writeSignedByte(offsetY, Packets.bytes, Packets.bytes.length);
    }

    static writeStartNewRaftPacket(raftID, position) {
        Packets.bytes.push(Packets.PACKET_START_NEW_RAFT);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.y, Packets.bytes, Packets.bytes.length);
    }

    static writeConsumeWoodPacket(woodID) {
        Packets.bytes.push(Packets.PACKET_CONSUME_WOOD);
        BinaryHelper.writeInt(woodID, Packets.bytes, Packets.bytes.length);
    }

    static writeConsumeStonePacket(stoneID) {
        Packets.bytes.push(Packets.PACKET_CONSUME_STONE);
        BinaryHelper.writeInt(stoneID, Packets.bytes, Packets.bytes.length);
    }

    static writeSyncRaftPacket(raftID, position, velocity, rotation, rotationalVelocity) {
        Packets.bytes.push(Packets.PACKET_SYNC_RAFT);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.y, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocity.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocity.y, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(rotation, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(rotationalVelocity, Packets.bytes, Packets.bytes.length);
    }

    static writeBuildRaftPaddlePacket(raftID, offsetX, offsetY, localDirection) {
        Packets.bytes.push(Packets.PACKET_BUILD_RAFT_PADDLE);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(localDirection.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(localDirection.y, Packets.bytes, Packets.bytes.length);
    }

    static writeInteractionPacket(entityID, raftID, offsetX, offsetY) {
        Packets.bytes.push(Packets.PACKET_INTERACTION);
        BinaryHelper.writeInt(entityID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetY, Packets.bytes, Packets.bytes.length);
    }

    static writeClearInteractionPacket(entityID, raftID, offsetX, offsetY) {
        Packets.bytes.push(Packets.PACKET_CLEAR_INTERACTION);
        BinaryHelper.writeInt(entityID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetY, Packets.bytes, Packets.bytes.length);
    }

    static writeWoodPositionsPacket(list) {
        Packets.bytes.push(Packets.PACKET_WOOD_POSITIONS);
        BinaryHelper.writeInt(list.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < list.length; i += 3) {
            BinaryHelper.writeInt(list[i], Packets.bytes, Packets.bytes.length);
            BinaryHelper.writeFloat(list[i + 1], Packets.bytes, Packets.bytes.length);
            BinaryHelper.writeFloat(list[i + 2], Packets.bytes, Packets.bytes.length);
        }
    }

    static writeRockPositionsPacket(list) {
        Packets.bytes.push(Packets.PACKET_ROCK_POSITIONS);
        BinaryHelper.writeInt(list.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < list.length; i += 3) {
            BinaryHelper.writeInt(list[i], Packets.bytes, Packets.bytes.length);
            BinaryHelper.writeFloat(list[i + 1], Packets.bytes, Packets.bytes.length);
            BinaryHelper.writeFloat(list[i + 2], Packets.bytes, Packets.bytes.length);
        }
    }

    static writeHoldingPlebPacket(moonID, plebID, positionX, positionY, velocityX, velocityY) {
        Packets.bytes.push(Packets.PACKET_HOLDING_PLEB);
        BinaryHelper.writeInt(moonID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(plebID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(positionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(positionY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocityX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocityY, Packets.bytes, Packets.bytes.length);
    }

    static writeReleasePlebPacket(moonID, plebID, positionX, positionY, velocityX, velocityY) {
        Packets.bytes.push(Packets.PACKET_RELEASE_PLEB);
        BinaryHelper.writeInt(moonID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(plebID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(positionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(positionY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocityX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocityY, Packets.bytes, Packets.bytes.length);
    }

    static writeSharkPositionVelocityPacket(sharkID, positionX, positionY, velocityX, velocityY) {
        Packets.bytes.push(Packets.PACKET_SHARK_POSITION_VELOCITY);
        BinaryHelper.writeInt(sharkID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(positionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(positionY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocityX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(velocityY, Packets.bytes, Packets.bytes.length);
    }

    static writeBuildRaftHarpoonPacket(raftID, offsetX, offsetY, localDirection) {
        Packets.bytes.push(Packets.PACKET_BUILD_RAFT_HARPOON);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(localDirection.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(localDirection.y, Packets.bytes, Packets.bytes.length);
    }

    static writeLoadHarpoonPacket(raftID, entityID, offsetX, offsetY) {
        Packets.bytes.push(Packets.PACKET_LOAD_HARPOON);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(entityID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetY, Packets.bytes, Packets.bytes.length);
    }

    static writeHarpoonDirectionPacket(raftID, offsetX, offsetY, directionX, directionY) {
        Packets.bytes.push(Packets.PACKET_SET_HARPOON_DIRECTION);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(directionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(directionY, Packets.bytes, Packets.bytes.length);
    }

    static writeFireHarpoonPacket(raftID, offsetX, offsetY, directionX, directionY) {
        Packets.bytes.push(Packets.PACKET_FIRE_HARPOON);
        BinaryHelper.writeInt(raftID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(offsetY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(directionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(directionY, Packets.bytes, Packets.bytes.length);
    }

    static writeBitPacket(entityID) {
        Packets.bytes.push(Packets.PACKET_BIT);
        BinaryHelper.writeInt(entityID, Packets.bytes, Packets.bytes.length);
    }

    static writeMoonDownPacket(id, down) {
        Packets.bytes.push(Packets.PACKET_MOON_DOWN);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
        Packets.bytes.push(down ? 1 : 0);
    }

    static writeAimingPacket(aiming) {
        Packets.bytes.push(Packets.PACKET_AIMING);
        Packets.bytes.push(aiming ? 1 : 0);
    }

    static writeAimingDirectionPacket(directionX, directionY) {
        Packets.bytes.push(Packets.PACKET_AIMING_DIRECTION);
        BinaryHelper.writeFloat(directionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(directionY, Packets.bytes, Packets.bytes.length);
    }

    static writeFiredBulletPacket(positionX, positionY, directionX, directionY) {
        Packets.bytes.push(Packets.PACKET_FIRED_BULLET);
        BinaryHelper.writeFloat(positionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(positionY, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(directionX, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(directionY, Packets.bytes, Packets.bytes.length);
    }

    static writeCarryDeadPlebPacket(deadPlebID, playerID) {
        Packets.bytes.push(Packets.PACKET_CARRY_DEAD_PLEB);
        BinaryHelper.writeInt(deadPlebID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(playerID, Packets.bytes, Packets.bytes.length);
    }

    static writeConsumeDeadPlebPacket(deadPlebID) {
        Packets.bytes.push(Packets.PACKET_CONSUME_DEAD_PLEB);
        BinaryHelper.writeInt(deadPlebID, Packets.bytes, Packets.bytes.length);
    }

    static writeEatDeadPlebPacket(deadPlebID) {
        Packets.bytes.push(Packets.PACKET_EAT_DEAD_PLEB);
        BinaryHelper.writeInt(deadPlebID, Packets.bytes, Packets.bytes.length);
    }

    static writeDropDeadPlebPacket(deadPlebID, position) {
        Packets.bytes.push(Packets.PACKET_DROP_DEAD_PLEB);
        BinaryHelper.writeInt(deadPlebID, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.x, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeFloat(position.y, Packets.bytes, Packets.bytes.length);
    }

    static writeDeadPlebPositionsPacket(list) {
        Packets.bytes.push(Packets.PACKET_DEAD_PLEB_POSITIONS);
        BinaryHelper.writeInt(list.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < list.length; i += 3) {
            BinaryHelper.writeInt(list[i], Packets.bytes, Packets.bytes.length);
            BinaryHelper.writeFloat(list[i + 1], Packets.bytes, Packets.bytes.length);
            BinaryHelper.writeFloat(list[i + 2], Packets.bytes, Packets.bytes.length);
        }
    }

    static writeSetSpawnIslandPacket(index) {
        Packets.bytes.push(Packets.PACKET_SET_SPAWN_ISLAND);
        Packets.bytes.push(index);
    }

    static writeEmptyPacket() {
        Packets.bytes.push(Packets.PACKET_EMPTY);
    }

    static writeSharkDeletePacket(id) {
        Packets.bytes.push(Packets.PACKET_SHARK_DELETE);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
    }

    static writeUsernamePacket(id, username) {
        Packets.bytes.push(Packets.PACKET_USERNAME);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(username.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < username.length; i++) {
            BinaryHelper.writeInt(username.charCodeAt(i), Packets.bytes, Packets.bytes.length);
        }
    }

    static writeDestroyRaftPacket(id) {
        Packets.bytes.push(Packets.PACKET_DESTROY_RAFT);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
    }

    static writeChatPacket(id, message) {
        if (message.length > 240) {
            return;
        }

        Packets.bytes.push(Packets.PACKET_CHAT);
        BinaryHelper.writeInt(id, Packets.bytes, Packets.bytes.length);
        BinaryHelper.writeInt(message.length, Packets.bytes, Packets.bytes.length);
        for (let i = 0; i < message.length; i++) {
            BinaryHelper.writeInt(message.charCodeAt(i), Packets.bytes, Packets.bytes.length);
        }
    }
}

const readSignedByte = (byte) => {
    BinaryHelper._byteBuffer[0] = byte;
    return Packets.signedByteBuffer[0];
};

const writeSignedByte = (byte, bytes, index) => {
    Packets.signedByteBuffer[0] = byte;
    const unsignedByte = BinaryHelper._byteBuffer[0];
    bytes[index] = unsignedByte;
    return index + 1;
};