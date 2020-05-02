export class Color {
    static hexToRgba(hex: string) {
        let c: string[];
        let d: number;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length == 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            d = +('0x' + c.join(''));
            return 'rgba(' + [(d >> 16) & 255, (d >> 8) & 255, d & 255].join(',') + ',1)';
        }
    }
}
