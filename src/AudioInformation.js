class AudioInformation {
    static SCALE = 0.5;

    static cannon = new NSWA.Source('assets/cannon-shot.ogg', {volume: 0.5});
    static walk_wood = new NSWA.Source('assets/walk-wood.ogg', {loop: false, volume: 0.5});
    static walk = new NSWA.Source('assets/walk2.ogg', {loop: false, volume: 0.15});
    static underwater = new NSWA.Source('assets/underwater-bubbles.ogg', {volume: 0.3});
    static swing = new NSWA.Source('assets/swing.ogg', {volume: 0.2});
    static swim = new NSWA.Source('assets/swim.ogg', {loop: false, volume: 0.1});
    static shark_hit = new NSWA.Source('assets/shark-hit.ogg');
    // static seagulls = new NSWA.Source('assets/seagulls.wav', {loop: false});
    static raft_break = new NSWA.Source('assets/raft-break.ogg', {volume: 0.2});
    static paddle = new NSWA.Source('assets/paddle.ogg', {loop: false, volume: 0.3});
    static open_map = new NSWA.Source('assets/open-map1.ogg', {volume: 0.2});
    static ocean = new NSWA.Source('assets/ocean-waves.ogg', {loop: false, volume: 0.3});
    static hit_rock = new NSWA.Source('assets/hit-rock.ogg', {volume: 0.5});
    static gun_shot = new NSWA.Source('assets/gunshot-2.ogg', {volume: 0.4});
    static eat = new NSWA.Source('assets/eat.ogg');
    // static dive = new NSWA.Source('assets/dive.wav');
    static chop_tree = new NSWA.Source('assets/chop-tree.ogg', {volume: 0.4});
    static mainMenuMusic = new NSWA.Source('assets/alexander-nakarada-be-jammin.ogg', {volume: 0.15});

    static audio = [];
    static underwaterAudio = null;

    static currentMainMenuMusic = null;

    static initialize() {
        NSWA.setListenerOrientation(0, 0, 1, 0, -1, 0);

        const ocean = AudioInformation.ocean.create();
        ocean.play();
        ocean.setLoop(true);

        AudioInformation.currentMainMenuMusic = AudioInformation.mainMenuMusic.create();
        if (MainMenu.musicEnabled) {
            AudioInformation.currentMainMenuMusic.play();
        }
    }

    static update() {
        for (let i = 0; i < this.audio.length; i++) {
            if (isAudioFinished(this.audio[i])) {
                this.audio[i].stop();
                this.audio.splice(i, 1);
                i--;
            }
        }

        const clientEntity = EntityInformation.getClientEntity();
        if (clientEntity) {
            if (clientEntity.headUnderwater && !AudioInformation.underwaterAudio) {
                AudioInformation.underwaterAudio = AudioInformation.underwater.create();
                AudioInformation.underwaterAudio.setLoop(true);
                AudioInformation.underwaterAudio.seek(AudioInformation.underwaterAudio._source.getDuration() * Math.random());
                AudioInformation.underwaterAudio.play();
            } else if (!clientEntity.headUnderwater && AudioInformation.underwaterAudio) {
                AudioInformation.underwaterAudio.stop();
                AudioInformation.underwaterAudio = null;
            }
        }
    }

    static playAudio(instance) {
        instance.play();
        this.audio.push(instance);
    }
}