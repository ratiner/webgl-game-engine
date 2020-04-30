import { GameContext } from '../game-context';
import { GameObject } from './game-object';
import { BlendMode } from './enums';
import { BackBufferOptions, BackBuffer } from './back-buffer';

export abstract class GameLayer {
    layers: GameLayer[];
    objects: GameObject[];
    blendMode: BlendMode;

    private layerBuffer: BackBuffer;

    constructor(public context: GameContext, opts?: BackBufferOptions) {
        this.layers = [];
        this.objects = [];

        this.layerBuffer = new BackBuffer(context, opts);
        this.blendMode = BlendMode.ALPHA;
    }

    abstract update(): void;

    draw(buffer: BackBuffer = null): void {
        this.update(); // Get updates before drawing

        const gl = this.context.gl;

        this.context.setBuffer(this.layerBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT);

        this.objects.forEach((object) => object.draw());

        this.layers.forEach((layer) => layer.draw(this.layerBuffer));

        // set the layer blend mode
        this.context.setBlendMode(this.blendMode);
        // set back the previos buffer
        this.context.setBuffer(buffer);
        // draw this layer into the parent buffer
        this.layerBuffer.draw();
    }
}

export class SimpleGameLayer extends GameLayer {
    update(): void {}
}
