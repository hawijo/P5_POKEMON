import { makeNPC } from "../entities/NPC.js";
import { makePlayer } from "../entities/player.js";
import { makeTiledMap } from "../maps/map.js";
import { makeCamera } from "../utils/camera.js";
import { makeDialogBox } from "../utils/ui.js";

export function makeWorld(p, setScene) {
  return {
    p,
    camera: makeCamera(p, 100, 0),
    player: makePlayer(p, 0, 0),
    npc: makeNPC(p, 0, 0),
    map: makeTiledMap(p, 100, -150),
    dialogBox: makeDialogBox(p, 0, 280),
    makeScreenFlash: false,
    alpha: 0,
    blinkBack: false,
    easing: 3,
    load() {
      this.dialogBox.load();
      this.map.load("./assets/Trainer Tower interior.png", "./maps/world.json");
      this.player.load();
      this.npc.load();
    },
    setup() {
      this.map.prepareTiles();
      const spawnPoints = this.map.getSpawnPoints();
      for (const spawnPoint of spawnPoints) {
        switch (spawnPoint.name) {
          case "player":
            this.player.x = spawnPoint.x;
            this.player.y = this.map.y + spawnPoint.y + 32;
            break;
          case "npc":
            this.npc.x = spawnPoint.x;
            this.npc.y = this.map.y + spawnPoint.y + 32;
            break;
          default:
        }
      }
      this.player.prepareAnims();
      this.player.setAnim("idle-down");
      this.camera.attachTo(this.player);

      this.npc.prepareAnims();
      this.npc.setAnim("idle-down");
    },

    draw() {
      if (this.alpha <= 0) this.blinkBack = true;
      if (this.alpha >= 255) this.blinkBack = false;

      if (this.blinkBack) {
        this.alpha += 0.7 * this.easing * this.p.deltaTime;
      } else {
        this.alpha -= 0.7 * this.easing * this.p.deltaTime;
      }
      if (this.makeScreenFlash) this.p.tint(255, this.alpha);
      this.camera.update();
      this.p.clear();
      this.p.background(0);
      this.player.update(); // this being before the map draw call is important
      this.npc.update();
      this.npc.handleCollisionsWith(this.player, () => {
        this.dialogBox.setText("I see that you need training.\nLet's battle!");
        this.dialogBox.setVisibility(true);
        this.dialogBox.onComplete(() => {
          setTimeout(() => {
            this.dialogBox.setVisibility(false);
            this.makeScreenFlash = true;
          }, 1000);
          setTimeout(() => {
            this.makeScreenFlash = false;
            setScene("battle");
          }, 2000);
        });
      });
      this.map.draw(this.camera, this.player);
      this.npc.draw(this.camera);
      this.player.draw(this.camera);
      this.dialogBox.update();
      this.dialogBox.draw();
      if (this.makeScreenFlash) this.p.noTint();
    },

    keyReleased() {
      for (const key of [
        this.p.RIGHT_ARROW,
        this.p.LEFT_ARROW,
        this.p.UP_ARROW,
        this.p.DOWN_ARROW,
      ]) {
        if (this.p.keyIsDown(key)) {
          return;
        }
      }

      switch (this.player.direction) {
        case "up":
          this.player.setAnim("idle-up");
          break;
        case "down":
          this.player.setAnim("idle-down");
          break;
        case "left":
          this.player.setAnim("idle-side");
          break;
        case "right":
          this.player.setAnim("idle-side");
          break;
        default:
      }
    },
  };
}