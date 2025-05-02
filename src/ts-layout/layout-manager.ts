import './layout.css';
import { LayoutItem } from "./layout-item";
import { LayoutDir, LayoutList } from "./layout-list";
import { LayoutTabs } from "./layout-tabs";
import $ from "jquery";

export class LayoutManager {
    root: LayoutList;
    inner: JQuery<HTMLElement>;
    overlay: JQuery<HTMLElement>;
    mx: number = 0;
    my: number = 0;
    dragged: LayoutItem | undefined = undefined;
    constructor(public outer: JQuery<HTMLElement>, root: LayoutList | LayoutTabs | LayoutItem) {
        this.overlay = $("<div></div>");
        this.overlay.addClass("layout-manager-overlay");
        outer.append(this.overlay);
        outer.addClass("layout-manager-outer");
        this.inner = $("<div></div>");
        this.inner.addClass("layout-manager-inner");
        let mm = (e: JQuery.Event) => {
            if (e.type == "touchstart") {
                this.mx = e.touches![0].clientX;
                this.my = e.touches![0].clientY;
            } else {
                this.mx = e.clientX!;
                this.my = e.clientY!;
            }
        };
        this.outer.on("mousemove", mm);
        this.outer.on("touchmove", mm);
        outer.append(this.inner);
        if (root instanceof LayoutItem) {
            let temp = root;
            root = new LayoutList(LayoutDir.H, [], undefined, this);
            root.items.push(new LayoutTabs([temp], root, this));
            root.draw();
        }
        if (root instanceof LayoutTabs) {
            root = new LayoutList(LayoutDir.H, [root], undefined, this);
        }
        this.root = root;
        this.inner.append(this.root.outer);
    }
}
