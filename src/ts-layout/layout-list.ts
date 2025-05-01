import { LayoutManager } from "./layout-manager";
import { LayoutTabs } from "./layout-tabs";
import $ from "jquery";

export class LayoutList {
    outer: JQuery<HTMLElement>;
    middle: JQuery<HTMLElement>;
    innerDivs: JQuery<HTMLElement>[] = [];
    percentages: number[] = [];
    minWith: number = 0;
    minHeight: number = 0;
    constructor(public dir: LayoutDir, public items: (LayoutList | LayoutTabs)[], public parent:LayoutList|undefined, public manager: LayoutManager) {
        this.outer = $("<div></div>");
        this.outer.addClass("layout-list-outer " + ["layout-list-h", "layout-list-v"][dir]);
        this.middle = $("<div></div>");
        this.middle.addClass("layout-list-middle " + ["layout-list-h", "layout-list-v"][dir]);
        this.outer.append(this.middle);
        this.draw();
    }
    draw() {
        this.innerDivs = [];
        this.percentages = [];
        this.middle.empty();
        if (this.items.length == 0) {
            this.parent?.items.splice(this.parent?.items.indexOf(this), 1);
            this.parent?.innerDivs.splice(this.parent?.items.indexOf(this), 1);
            this.parent?.draw();
            return;
        }
        this.minWith = 0;
        this.minHeight = 0;
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            if (this.dir == LayoutDir.H) {
                this.minWith += item.minWith;
                this.minHeight = Math.max(item.minHeight, this.minHeight);
            } else {
                this.minHeight += item.minHeight;
                this.minWith = Math.max(item.minWith, this.minWith);
            }
        }
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            let inner = $("<div></div>");
            inner.addClass("layout-list-inner");
            this.innerDivs.push(inner);
            if (i != 0) {
                let line = $("<div></div>");
                line.addClass("layout-list-line " + ["layout-list-line-h", "layout-list-line-v"][this.dir]);
                this.middle.append(line);
                line.on("mousedown", () => {
                    this.manager.overlay.addClass("layout-manager-overlay-active");
                    let sx = this.manager.mx;
                    let sy = this.manager.my;
                    let pc1 = this.percentages[i - 1];
                    let pc2 = this.percentages[i];
                    let mind = this.dir == LayoutDir.H
                        ? (-this.innerDivs[i - 1].width()! + this.items[i - 1].minWith) * 100 / this.middle.width()!
                        : (-this.innerDivs[i - 1].height()! + this.items[i - 1].minHeight) * 100 / this.middle.height()!;
                    let maxd = this.dir == LayoutDir.H
                        ? (this.innerDivs[i].width()! - this.items[i].minWith) * 100 / this.middle.width()!
                        : (this.innerDivs[i].height()! - this.items[i].minHeight) * 100 / this.middle.height()!;
                    this.manager.overlay.on("mousemove.bar", (e: JQuery.Event) => {
                        let dx = e.clientX! - sx;
                        let dy = e.clientY! - sy;
                        if (this.dir == LayoutDir.H) {
                            let d = dx / this.middle.width()! * 100;
                            d = Math.max(mind, Math.min(maxd, d));
                            this.percentages[i - 1] = pc1 + d;
                            this.percentages[i] = pc2 - d;
                        }
                        else {
                            let d = dy / this.middle.height()! * 100;
                            d = Math.max(mind, Math.min(maxd, d));
                            this.percentages[i - 1] = pc1 + d;
                            this.percentages[i] = pc2 - d;
                        }
                        this.innerDivs[i - 1].css(this.dir == LayoutDir.H ? "width" : "height", this.percentages[i - 1] + "%");
                        this.innerDivs[i].css(this.dir == LayoutDir.H ? "width" : "height", this.percentages[i] + "%");
                    });
                    $(document).on("mouseup.bar", () => {
                        this.manager.overlay.removeClass("layout-manager-overlay-active");
                        this.manager.overlay.off("mousemove.bar");
                        $(document).off("mouseup.bar");
                    });
                });
            }
            this.middle.append(inner);
            if (item instanceof LayoutList) {
                inner.append(item.outer);
            } else {
                inner.append(item.outer);
            }
            if (this.dir == LayoutDir.H) {
                inner.css("width", 100 / this.items.length + "%");
            } else {
                inner.css("height", 100 / this.items.length + "%");
            }
            this.percentages.push(100 / this.items.length);
        }
    }
}
export enum LayoutDir {
    H,
    V,
}