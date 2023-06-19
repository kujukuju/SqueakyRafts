class PacketProcessor {
    static bytesList = [];
    // static index = 0;
    
    static receive(bytes) {
        PacketProcessor.bytesList.push(bytes);
    }

    static update() {
        for (let i = 0; i < PacketProcessor.bytesList.length; i++) {
            if (!PacketProcessor.process(PacketProcessor.bytesList[i])) {
                console.error('Did not get to the end of the byte stream.');
            }
        }

        PacketProcessor.bytesList.length = 0;
    }

    static process(bytes) {
        let index = 0;

        while (index < bytes.length) {
            const type = bytes[index++];

            switch (type) {
                case Packets.PACKET_MOON: {
                    const id = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const moon = !!bytes[index++];

                    if (id === EntityInformation.getClientEntityID()) {
                        continue;
                    }

                    if (EntityInformation.hasEntity(id)) {
                        continue;
                    }

                    if (PlebDeathManager.getDeadPleb(id)) {
                        continue;
                    }

                    if (moon) {
                        EntityInformation.addEntity(id, new MoonEntity());
                    } else {
                        EntityInformation.addEntity(id, new PlebEntity());
                    }

                    continue;
                } break;
                
                case Packets.PACKET_POSITION_VELOCITY: {
                    // this should be sent every frame I guess
                    const id = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    if (id === EntityInformation.getClientEntityID()) {
                        continue;
                    }

                    const entity = EntityInformation.getEntity(id);
                    if (entity) {
                        EntityInformation.setResponseTime(id);
                        entity.setInterpolatedPositionVelocity(new Vec2(positionX, positionY), new Vec2(velocityX, velocityY));
                    }

                    continue;
                } break;
                
                case Packets.PACKET_VOICE: {
                    // this should be sent every frame I guess
                    const id = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const length = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    if (length === 0) {
                        continue;
                    }

                    const voice = new Array(length);
                    for (let i = 0; i < length; i++) {
                        voice[i] = BinaryHelper.readFloat(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );
                    }

                    if (id === EntityInformation.getClientEntityID()) {
                        continue;
                    }

                    const entity = EntityInformation.getEntity(id);
                    if (entity) {
                        entity.queueVoice(voice);
                        // entity.writeVoice(voice);
                    }

                    continue;
                } break;

                case Packets.PACKET_PUNCHING: {
                    const id = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const punching = !!bytes[index++];

                    if (id === EntityInformation.getClientEntityID()) {
                        continue;
                    }

                    const entity = EntityInformation.getEntity(id);
                    if (entity) {
                        entity.punching = punching;
                    }

                    continue;
                } break;

                case Packets.PACKET_SPAWN_WOOD: {
                    const treeID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const woodID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const playerID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const angle = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const speed = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const heightSpeed = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(playerID);
                    if (!entity) {
                        continue;
                    }

                    const tree = TreeManager.getTree(treeID);
                    if (!tree) {
                        continue;
                    }

                    tree.chopped();

                    const wood = WoodManager.getWood(woodID);
                    if (wood || Information.moon) {
                        continue;
                    }

                    const newWood = WoodManager.addWood(0, tree.position);
                    newWood.id = woodID;
                    newWood.angle = angle;
                    newWood.speed = speed;
                    newWood.direction = new Vec2(Math.cos(angle), Math.sin(angle));
                    newWood.heightSpeed = heightSpeed;

                    continue;
                } break;

                case Packets.PACKET_CARRY_WOOD: {
                    const woodID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const playerID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(playerID);
                    if (!entity) {
                        continue;
                    }

                    let wood = WoodManager.getWood(woodID);
                    if (!wood) {
                        wood = WoodManager.addWood(0, entity.getPosition());
                        wood.id = woodID;
                        wood.speed = 0;
                        wood.heightSpeed = 0;
                    }

                    wood.setCarry(entity, false);

                    continue;
                } break;

                case Packets.PACKET_DROP_WOOD: {
                    const woodID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const wood = WoodManager.getWood(woodID);
                    if (!wood) {
                        continue;
                    }

                    if (wood.playerID) {
                        const entity = EntityInformation.getEntity(wood.playerID);
                        if (entity && EntityInformation.getClientEntity() === entity) {
                            continue;
                        }
                    }

                    wood.release(false);
                    wood.position.x = positionX;
                    wood.position.y = positionY;

                    continue;
                } break;

                case Packets.PACKET_SPAWN_ROCK: {
                    const boulderID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const rockID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const playerID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const angle = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const speed = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const heightSpeed = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(playerID);
                    if (!entity) {
                        continue;
                    }

                    const boulder = BoulderManager.getBoulder(boulderID);
                    if (!boulder) {
                        continue;
                    }

                    boulder.break();

                    const rock = RockManager.getRock(rockID);
                    if (rock || Information.moon) {
                        continue;
                    }

                    const newRock = RockManager.addRock(0, boulder.position);
                    newRock.id = rockID;
                    newRock.angle = angle;
                    newRock.speed = speed;
                    newRock.direction = new Vec2(Math.cos(angle), Math.sin(angle));
                    newRock.heightSpeed = heightSpeed;

                    continue;
                } break;

                case Packets.PACKET_CARRY_ROCK: {
                    const rockID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const playerID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(playerID);
                    if (!entity) {
                        continue;
                    }

                    let rock = RockManager.getRock(rockID);
                    if (!rock) {
                        rock = RockManager.addRock(0, entity.getPosition());
                        rock.id = rockID;
                        rock.speed = 0;
                        rock.heightSpeed = 0;
                    }

                    rock.setCarry(entity, false);

                    continue;
                } break;

                case Packets.PACKET_DROP_ROCK: {
                    const rockID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const rock = RockManager.getRock(rockID);
                    if (!rock) {
                        continue;
                    }

                    if (rock.playerID) {
                        const entity = EntityInformation.getEntity(rock.playerID);
                        if (entity && EntityInformation.getClientEntity() === entity) {
                            continue;
                        }
                    }

                    rock.release(false);
                    rock.position.x = positionX;
                    rock.position.y = positionY;

                    continue;
                } break;

                case Packets.PACKET_ADD_RAFT_PARTS: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const raftX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const raftY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const partsCount = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const offsets = [];
                    for (let i = 0; i < partsCount; i++) {
                        offsets.push(readSignedByte(
                            bytes[index++],
                        ));
                    }

                    const paddleCount = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const paddleOffsets = [];
                    for (let i = 0; i < paddleCount; i++) {
                        paddleOffsets.push(readSignedByte(
                            bytes[index++],
                        ));
                    }

                    const harpoonCount = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const harpoonOffsets = [];
                    for (let i = 0; i < harpoonCount; i++) {
                        harpoonOffsets.push(readSignedByte(
                            bytes[index++],
                        ));
                    }

                    // moon doesnt add raft parts from this packet
                    if (Information.moon) {
                        continue;
                    }

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        let addedCenter = false;
                        raft = RaftManager.addRaft(new Vec2(raftX, raftY));
                        raft.id = raftID;
                        for (let i = 0; i < offsets.length; i += 2) {
                            // god im fucking stupid
                            let x = offsets[i];
                            let y = offsets[i + 1];
                            if (x === 0 && y === 0) {
                                addedCenter = true;
                            }
                            raft.addPart(x, y, false);
                        }
                        if (!addedCenter) {
                            // 0 0 is added by default so remove it
                            raft.removePart(0, 0, false);
                        }
                        for (let i = 0; i < paddleOffsets.length; i += 4) {
                            let x = paddleOffsets[i];
                            let y = paddleOffsets[i + 1];
                            let localX = paddleOffsets[i + 2];
                            let localY = paddleOffsets[i + 3];
                            raft.addPaddle(x, y, false, new Vec2(localX, localY));
                        }
                        for (let i = 0; i < harpoonOffsets.length; i += 5) {
                            let x = harpoonOffsets[i];
                            let y = harpoonOffsets[i + 1];
                            let localX = harpoonOffsets[i + 2];
                            let localY = harpoonOffsets[i + 3];
                            let ammo = harpoonOffsets[i + 4];
                            const harpoon = raft.addHarpoon(x, y, false, new Vec2(localX, localY));
                            if (harpoon) {
                                harpoon.setAmmoCount(ammo);
                            }
                        }
                    } else {
                        for (let i = 0; i < offsets.length; i += 2) {
                            let x = offsets[i];
                            let y = offsets[i + 1];
                            raft.addPart(x, y, false);
                        }
                        for (let i = 0; i < paddleOffsets.length; i += 4) {
                            let x = paddleOffsets[i];
                            let y = paddleOffsets[i + 1];
                            let localX = paddleOffsets[i + 2];
                            let localY = paddleOffsets[i + 3];
                            raft.addPaddle(x, y, false, new Vec2(localX, localY));
                        }
                        for (let i = 0; i < harpoonOffsets.length; i += 5) {
                            let x = harpoonOffsets[i];
                            let y = harpoonOffsets[i + 1];
                            let localX = harpoonOffsets[i + 2];
                            let localY = harpoonOffsets[i + 3];
                            let ammo = harpoonOffsets[i + 4];
                            const harpoon = raft.addHarpoon(x, y, false, new Vec2(localX, localY));
                            if (harpoon) {
                                harpoon.setAmmoCount(ammo);
                            }
                        }
                    }

                    continue;
                } break;

                case Packets.PACKET_BUILD_RAFT_PART: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = readSignedByte(bytes[index++]);
                    const offsetY = readSignedByte(bytes[index++]);

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    raft.addPart(offsetX, offsetY, false);

                    continue;
                } break;

                case Packets.PACKET_DESTROY_RAFT_PART: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = readSignedByte(bytes[index++]);
                    const offsetY = readSignedByte(bytes[index++]);

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    raft.removePart(offsetX, offsetY, false);

                    continue;
                } break;

                case Packets.PACKET_START_NEW_RAFT: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const raftX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const raftY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let raft = RaftManager.getRaft(raftID);
                    if (raft) {
                        continue;
                    }

                    raft = RaftManager.addRaft(new Vec2(raftX, raftY));
                    raft.id = raftID;

                    continue;
                } break;

                case Packets.PACKET_CONSUME_WOOD: {
                    const woodID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const wood = WoodManager.getWood(woodID);
                    if (!wood) {
                        continue;
                    }

                    wood.consume(false);

                    continue;
                } break;

                case Packets.PACKET_CONSUME_STONE: {
                    const stoneID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const stone = RockManager.getRock(stoneID);
                    if (!stone) {
                        continue;
                    }

                    stone.consume(false);

                    continue;
                } break;

                case Packets.PACKET_SYNC_RAFT: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const rotation = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const rotationalVelocity = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    // moon only informs about rafts
                    if (Information.moon) {
                        continue;
                    }

                    const raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    // raft.setPosition(new Vec2(positionX, positionY));
                    // raft.setVelocity(new Vec2(velocityX, velocityY));
                    // raft.setInterpolatedPositionVelocity(new Vec2(positionX, positionY), new Vec2(velocityX, velocityY));
                    // raft.setRotation(rotation);
                    // raft.setRotationalVelocity(rotationalVelocity);
                    // raft.position.set(positionX, positionY);
                    raft.position.set(positionX, positionY);
                    raft.velocity.set(velocityX, velocityY);
                    raft.rotation = rotation;
                    raft.rotationalVelocity = rotationalVelocity;

                    continue;
                } break;

                case Packets.PACKET_BUILD_RAFT_PADDLE: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const localDirectionX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const localDirectionY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    raft.addPaddle(offsetX, offsetY, false, new Vec2(localDirectionX, localDirectionY));

                    continue;
                } break;

                case Packets.PACKET_INTERACTION: {
                    const entityID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(entityID);
                    if (!entity) {
                        continue;
                    }

                    if (entity === EntityInformation.getClientEntity()) {
                        continue;
                    }

                    const raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    entity.setInteraction(raftID, offsetX, offsetY, false);

                    continue;
                } break;

                case Packets.PACKET_CLEAR_INTERACTION: {
                    const entityID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(entityID);
                    if (!entity) {
                        continue;
                    }

                    if (entity === EntityInformation.getClientEntity()) {
                        continue;
                    }

                    const raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    let sameInteraction = true;
                    sameInteraction = sameInteraction && entity.interactingRaftID === raftID;
                    sameInteraction = sameInteraction && entity.interactingOffsets.x === offsetX;
                    sameInteraction = sameInteraction && entity.interactingOffsets.y === offsetY;
                    if (sameInteraction) {
                        entity.clearInteraction(false);
                    }

                    continue;
                } break;

                case Packets.PACKET_WOOD_POSITIONS: {
                    const count = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    for (let i = 0; i < count; i += 3) {
                        const woodID = BinaryHelper.readInt(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );
                        const x = BinaryHelper.readFloat(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );
                        const y = BinaryHelper.readFloat(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );

                        const wood = WoodManager.getWood(woodID);
                        if (wood && wood.onRaft) {
                            wood.position.x = x;
                            wood.position.y = y;
                        }
                    }

                    continue;
                } break;

                case Packets.PACKET_ROCK_POSITIONS: {
                    const count = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    for (let i = 0; i < count; i += 3) {
                        const rockID = BinaryHelper.readInt(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );
                        const x = BinaryHelper.readFloat(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );
                        const y = BinaryHelper.readFloat(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );

                        const rock = RockManager.getRock(rockID);
                        if (rock && rock.onRaft) {
                            rock.position.x = x;
                            rock.position.y = y;
                        }
                    }

                    continue;
                } break;

                case Packets.PACKET_HOLDING_PLEB: {
                    const moonID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const plebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const moon = EntityInformation.getEntity(moonID);
                    if (!moon || !(moon instanceof MoonEntity)) {
                        continue;
                    }

                    if (EntityInformation.getClientEntity() === moon) {
                        continue;
                    }

                    const pleb = EntityInformation.getEntity(plebID);
                    if (!pleb || (pleb instanceof MoonEntity)) {
                        continue;
                    }

                    if (EntityInformation.getClientEntity() !== pleb) {
                        continue;
                    }

                    moon.holdingPlayerID = plebID;
                    pleb.beingCarried = true;
                    pleb.setPosition(new Vec2(positionX, positionY));
                    pleb.setVelocity(new Vec2(velocityX, velocityY));

                    continue;
                } break;

                case Packets.PACKET_RELEASE_PLEB: {
                    const moonID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const plebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const pleb = EntityInformation.getEntity(plebID);
                    if (!pleb || (pleb instanceof MoonEntity)) {
                        continue;
                    }

                    if (EntityInformation.getClientEntity() !== pleb) {
                        continue;
                    }

                    const moon = EntityInformation.getEntity(moonID);
                    if (!moon || !(moon instanceof MoonEntity)) {
                        continue;
                    }

                    if (EntityInformation.getClientEntity() === moon) {
                        continue;
                    }

                    moon.holdingPlayerID = 0;
                    pleb.beingCarried = false;

                    pleb.setPosition(new Vec2(positionX, positionY));
                    pleb.setVelocity(new Vec2(velocityX, velocityY));
                    pleb.carryReleasedTime = Loop.time;

                    continue;
                } break;

                case Packets.PACKET_SHARK_POSITION_VELOCITY: {
                    const sharkID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const velocityY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    if (Information.moon) {
                        continue;
                    }

                    let shark = SharkManager.getShark(sharkID);
                    if (!shark) {
                        shark = SharkManager.addShark(sharkID, new Vec2(positionX, positionY));
                    }

                    const vel = new Vec2(velocityX, velocityY);

                    shark.position.x = positionX;
                    shark.position.y = positionY;
                    shark.speed = vel.length();
                    if (vel.x !== 0 || vel.y !== 0) {
                        shark.direction.copy(vel.normalize());
                    }

                    continue;
                } break;

                case Packets.PACKET_BUILD_RAFT_HARPOON: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const localDirectionX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const localDirectionY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    raft.addHarpoon(offsetX, offsetY, false, new Vec2(localDirectionX, localDirectionY));

                    continue;
                } break;

                case Packets.PACKET_LOAD_HARPOON: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const entityID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    let entity = EntityInformation.getEntity(entityID);
                    if (!entity) {
                        continue;
                    }

                    if (entity === EntityInformation.getClientEntity()) {
                        continue;
                    }

                    const harpoon = raft.getHarpoonAtOffset(offsetX, offsetY);
                    if (!harpoon) {
                        continue;
                    }

                    harpoon.loadRock(raft, entityID, false);

                    continue;
                } break;

                case Packets.PACKET_SET_HARPOON_DIRECTION: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const directionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const directionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    const harpoon = raft.getHarpoonAtOffset(offsetX, offsetY);
                    if (!harpoon) {
                        continue;
                    }

                    if (!harpoon.moonControlled && !harpoon.plebControlled) {
                        continue;
                    }

                    const you = EntityInformation.getClientEntity();
                    if (you && you.interactingRaftID === raft.id && you.interactingOffsets.x === offsetX && you.interactingOffsets.y === offsetY) {
                        continue;
                    }

                    harpoon.localDirection.x = directionX;
                    harpoon.localDirection.y = directionY;

                    continue;
                } break;

                case Packets.PACKET_FIRE_HARPOON: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetX = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const offsetY = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const directionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const directionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let raft = RaftManager.getRaft(raftID);
                    if (!raft) {
                        continue;
                    }

                    const harpoon = raft.getHarpoonAtOffset(offsetX, offsetY);
                    if (!harpoon) {
                        continue;
                    }

                    if (!harpoon.moonControlled && !harpoon.plebControlled) {
                        continue;
                    }

                    const you = EntityInformation.getClientEntity();
                    if (you && you.interactingRaftID === raft.id && you.interactingOffsets.x === offsetX && you.interactingOffsets.y === offsetY) {
                        continue;
                    }

                    harpoon.fire(raft, new Vec2(directionX, directionY), false);

                    continue;
                } break;

                case Packets.PACKET_BIT: {
                    const entityID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(entityID);
                    if (!entity) {
                        continue;
                    }

                    entity.bit();

                    continue;
                } break;

                case Packets.PACKET_MOON_DOWN: {
                    const entityID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const down = !!bytes[index++];

                    const entity = EntityInformation.getEntity(entityID);
                    if (!entity) {
                        continue;
                    }
                    
                    if (EntityInformation.getClientEntity() === entity) {
                        continue;
                    }

                    entity.downed = down;

                    continue;
                } break;

                case Packets.PACKET_AIMING: {
                    const aiming = !!bytes[index++];

                    if (EntityInformation.getClientEntity() instanceof MoonEntity) {
                        continue;
                    }

                    const entityList = EntityInformation.getEntityList();
                    for (let i = 0; i < entityList.length; i++) {
                        const entity = entityList[i];
                        if (entity instanceof MoonEntity) {
                            entity.aiming = aiming;
                            break;
                        }
                    }

                    continue;
                } break;

                case Packets.PACKET_AIMING_DIRECTION: {
                    const directionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const directionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    if (EntityInformation.getClientEntity() instanceof MoonEntity) {
                        continue;
                    }

                    const entityList = EntityInformation.getEntityList();
                    for (let i = 0; i < entityList.length; i++) {
                        const entity = entityList[i];
                        if (entity instanceof MoonEntity) {
                            entity.aimDirection.x = directionX;
                            entity.aimDirection.y = directionY;
                            break;
                        }
                    }

                    continue;
                } break;

                case Packets.PACKET_FIRED_BULLET: {
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const directionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const directionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    if (EntityInformation.getClientEntity() instanceof MoonEntity) {
                        continue;
                    }

                    GunBulletManager.addBullet(new Vec2(positionX, positionY), new Vec2(directionX, directionY));

                    continue;
                } break;

                case Packets.PACKET_CARRY_DEAD_PLEB: {
                    const deadPlebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const playerID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const entity = EntityInformation.getEntity(playerID);
                    if (!entity) {
                        continue;
                    }

                    let pleb = PlebDeathManager.getDeadPleb(deadPlebID);
                    if (!pleb) {
                        pleb = PlebDeathManager.addDeadPleb(deadPlebID, entity.getPosition());
                        pleb.speed = 0;
                        pleb.heightSpeed = 0;
                    }

                    pleb.setCarry(entity, false);

                    continue;
                } break;

                case Packets.PACKET_CONSUME_DEAD_PLEB: {
                    const deadPlebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const pleb = PlebDeathManager.getDeadPleb(deadPlebID);
                    if (!pleb) {
                        continue;
                    }

                    pleb.consume(false);

                    continue;
                } break;

                case Packets.PACKET_EAT_DEAD_PLEB: {
                    const deadPlebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const pleb = PlebDeathManager.getDeadPleb(deadPlebID);
                    if (!pleb) {
                        continue;
                    }

                    pleb.eat(false);

                    continue;
                } break;

                case Packets.PACKET_DROP_DEAD_PLEB: {
                    const plebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionX = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );
                    const positionY = BinaryHelper.readFloat(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const pleb = PlebDeathManager.getDeadPleb(plebID);
                    if (!pleb) {
                        continue;
                    }

                    if (pleb.playerID) {
                        const entity = EntityInformation.getEntity(pleb.playerID);
                        if (entity && EntityInformation.getClientEntity() === entity) {
                            continue;
                        }
                    }

                    pleb.release(false);
                    pleb.position.x = positionX;
                    pleb.position.y = positionY;

                    continue;
                } break;

                case Packets.PACKET_DEAD_PLEB_POSITIONS: {
                    const count = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    for (let i = 0; i < count; i += 3) {
                        const plebID = BinaryHelper.readInt(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );
                        const x = BinaryHelper.readFloat(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );
                        const y = BinaryHelper.readFloat(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        );

                        const pleb = PlebDeathManager.getDeadPleb(plebID);
                        if (pleb && pleb.onRaft) {
                            pleb.position.x = x;
                            pleb.position.y = y;
                        }
                    }

                    continue;
                } break;
s
                case Packets.PACKET_SET_SPAWN_ISLAND: {
                    const island = bytes[index++];

                    if (Information.moon) {
                        continue;
                    }

                    IslandManager.spawnIsland = island;

                    continue;
                } break;

                case Packets.PACKET_EMPTY: {
                    continue;
                } break;

                case Packets.PACKET_SHARK_DELETE: {
                    const sharkID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    SharkManager.deleteShark(sharkID);

                    continue;
                } break;

                case Packets.PACKET_USERNAME: {
                    const plebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const usernameLength = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let username = '';

                    for (let i = 0; i < usernameLength; i++) {
                        username = username + String.fromCharCode(BinaryHelper.readInt(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        ));
                    }

                    const pleb = EntityInformation.getEntity(plebID);
                    if (pleb) {
                        pleb.username = username;
                    }

                    continue;
                } break;

                case Packets.PACKET_DESTROY_RAFT: {
                    const raftID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const raft = RaftManager.getRaft(raftID);
                    if (raft) {
                        raft.destroyRaft(false);
                    }

                    continue;
                } break;

                case Packets.PACKET_CHAT: {
                    const plebID = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    const messageLength = BinaryHelper.readInt(
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                        bytes[index++],
                    );

                    let message = '';

                    for (let i = 0; i < messageLength; i++) {
                        message = message + String.fromCharCode(BinaryHelper.readInt(
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                            bytes[index++],
                        ));
                    }

                    ChatManager.receivedMessage(plebID, message);

                    continue;
                } break;

                default:
                    // basically were incrementing by 1 and coninuing
                    console.error('Received invalid type. ', type);
                    continue;
            }
        }

        return index === bytes.length;
    }
}