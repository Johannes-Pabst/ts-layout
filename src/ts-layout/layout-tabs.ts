import { LayoutItem } from "./layout-item";
import { LayoutDir, LayoutList } from "./layout-list";
import $ from "jquery";
import { LayoutManager } from "./layout-manager";

export class LayoutTabs {
    outer: JQuery<HTMLElement>;
    inner: JQuery<HTMLElement>;
    innerDivs: JQuery<HTMLElement>[] = [];
    header: JQuery<HTMLElement>;
    active: number = 0;
    minWith: number = 50;
    minHeight: number = 50;
    constructor(public items: LayoutItem[], public parent: LayoutList, public manager: LayoutManager) {
        this.outer = $("<div></div>");
        this.outer.addClass("layout-tabs-outer");
        this.header = $("<div></div>");
        this.header.addClass("layout-tabs-header");
        this.header.on("mouseup",()=>{
            if(this.manager.dragged!=undefined){
                this.items.push(this.manager.dragged);
                this.manager.dragged=undefined;
                this.draw();
            }
        })
        this.outer.append(this.header);
        this.inner = $("<div></div>");
        this.inner.addClass("layout-tabs-inner");
        this.inner.css("min-width", this.minWith + "px");
        this.inner.css("min-height", this.minHeight + "px");
        this.outer.append(this.inner);
        this.draw();
    }
    private draw() {
        this.innerDivs = [];
        this.header.empty();
        this.inner.empty();
        if (this.items.length == 0) {
            this.parent.innerDivs.splice(this.parent.items.indexOf(this), 1);
            this.parent.items.splice(this.parent.items.indexOf(this), 1);
            this.parent.draw();
            return;
        }
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            let inner = $("<div></div>");
            inner.addClass("layout-tabs-inner-item");
            this.innerDivs.push(inner);
            this.inner.append(inner);
            inner.append(item.div);
            let tab = $("<div></div>");
            tab.addClass("layout-tabs-tab");
            tab.text("Tab " + i);
            this.header.append(tab);
            tab.text("Tab " + i);
            tab.on("click", () => {
                this.setActive(i);
                console.log("click");
            });
            let md = false;
            let sx = 0;
            let sy = 0;
            tab.on("mousedown", (e: JQuery.Event) => {
                sx = this.manager.mx;
                sy = this.manager.my;
                md = true;
            });
            let mu=(e: JQuery.Event) => {
                md = false;
            };
            let mm=(e: JQuery.Event) => {
                if (md&& this.manager.dragged == undefined) {
                    this.manager.dragged = item;
                    this.items.splice(i, 1);
                    this.manager.outer.off("mousemove", mm);
                    tab.off("mousedown");
                    $(document).off("mouseup",mu);
                    this.draw();
                }
            };
            this.manager.outer.on("mousemove", mm);
            $(document).on("mouseup", mu);
        }
        this.setActive(this.active);
    }

    public add(hv: LayoutDir, bf: 1 | -1, items: LayoutItem[]) {
        let tid = this.parent.items.indexOf(this);
        if (this.parent.dir != hv) {
            this.parent.items[tid] = new LayoutList(hv, [this],this.parent, this.parent.manager);
            this.parent.innerDivs[tid].empty();
            this.parent.innerDivs[tid].append(this.parent.items[tid].outer);
            this.parent = this.parent.items[tid];
            let item = new LayoutTabs(items, this.parent, this.manager);
            if (bf == 1) {
                this.parent.items.push(item);
            } else {
                this.parent.items.unshift(item);
            }
            this.parent.draw();
            this.parent.parent?.draw();
        } else {
            let item = new LayoutTabs(items, this.parent, this.manager);
            let size = this.parent.percentages[tid] / 2;
            this.parent.items.splice(bf == 1 ? tid + 1 : tid, 0, item);
            this.parent.percentages.splice(tid, 1, size, size);
            this.parent.draw();
            for (let i = 0; i < this.parent.innerDivs.length; i++) {
                const element = this.parent.innerDivs[i];
                element.css(this.parent.dir == LayoutDir.H ? "width" : "height", this.parent.percentages[i] + "%");
            }
        }
    }
    public setActive(index: number) {
        if (index < 0 || index >= this.items.length) return;
        this.active = index;
        for (let i = 0; i < this.innerDivs.length; i++) {
            if (i == index) {
                this.innerDivs[i].removeClass("layout-tab-hidden");
            } else {
                this.innerDivs[i].addClass("layout-tab-hidden");
            }
        }
    }
}