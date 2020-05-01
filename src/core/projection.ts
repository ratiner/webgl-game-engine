import { mat4 } from 'gl-matrix';

export class Projection {
    private matrix: mat4;
    type: ProjectionType;

    constructor() {
        // Defaults
        this.type = ProjectionType.Adaptive;
    }

    get value(): Float32List {
        return this.matrix;
    }

    setOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): void {
        this.matrix = mat4.create();
        mat4.ortho(this.matrix, left, right, bottom, top, near, far);
    }
}

export enum ProjectionType {
    Adaptive,
    Fixed,
}
