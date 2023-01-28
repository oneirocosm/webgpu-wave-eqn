export class ClickQueue {
    clicks: Array<[number, number]>;

    constructor() {
        this.clicks = [];
    }

    getContents(): Array<[number, number]> {
        let readyForEntry = this.clicks;
        this.clicks = [];
        return readyForEntry;
    }
}