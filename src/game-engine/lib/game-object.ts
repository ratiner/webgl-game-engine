import { Drawable } from './drawable';

export interface GameObject extends Drawable {
    x: number;
    y: number;
}
