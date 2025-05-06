import './layout.css';
import './newwin.css';
import './style.css';
import { LayoutItem } from "./layout-item";
import { LayoutDir, LayoutList } from "./layout-list";
import { LayoutTabs } from "./layout-tabs";
import $ from "jquery";

export class LayoutManager {
    root: LayoutList;
    inner: JQuery<HTMLElement>;
    overlay: JQuery<HTMLElement>;
    draggedDiv:JQuery<HTMLElement>;
    mx: number = 0;
    my: number = 0;
    dragged: LayoutItem | undefined = undefined;
    completeDrag: () => void = () => { };
    constructor(public outer: JQuery<HTMLElement>, root: LayoutList | LayoutTabs | LayoutItem) {
        this.overlay = $("<div></div>");
        this.overlay.addClass("layout-manager-overlay");
        outer.append(this.overlay);
        outer.addClass("layout-manager-outer");
        this.draggedDiv= $("<div></div>");
        this.draggedDiv.addClass("layout-manager-dragged-div");
        this.draggedDiv.css("display","none");
        this.inner = $("<div></div>");
        this.inner.addClass("layout-manager-inner");
        let mm = (e: JQuery.Event) => {
            if (e.type == "touchstart" || e.type == "touchmove") {
                this.mx = e.touches![0].clientX;
                this.my = e.touches![0].clientY;
            } else {
                this.mx = e.clientX!;
                this.my = e.clientY!;
            }
            let offset=this.overlay.offset();
            this.draggedDiv.css("left",this.mx-offset.left+"px");
            this.draggedDiv.css("top",this.my-offset.top+"px");
        };
        this.outer.on("mousemove", mm);
        this.outer.on("touchmove", mm);
        this.outer.on("touchstart", mm);
        $(document).on("touchstart", (e) => {
            let element = document.elementFromPoint(e.touches![0].clientX!, e.touches![0].clientY!);
            $(element!).trigger("customtouchstart", e);
        })
        $(document).on("touchmove", (e) => {
            let element = document.elementFromPoint(e.touches![0].clientX!, e.touches![0].clientY!);
            $(element!).trigger("customtouchmove", e);
        })
        $(document).on("touchend", (e) => {
            let element = document.elementFromPoint(e.changedTouches![0].clientX!, e.changedTouches![0].clientY!);
            $(element!).trigger("customtouchend", e);
        })
        $(document).on("touchleave", (e) => {
            let element = document.elementFromPoint(e.changedTouches![0].clientX!, e.changedTouches![0].clientY!);
            $(element!).trigger("customtouchleave", e);
        })
        outer.append(this.inner);
        if (root instanceof LayoutItem) {
            let temp = root;
            root = new LayoutList(LayoutDir.H, [], undefined, this);
            root.items.push(new LayoutTabs([temp], root, this));
        }
        if (root instanceof LayoutTabs) {
            root = new LayoutList(LayoutDir.H, [root], undefined, this);
        }
        this.root = root;
        this.inner.append(this.root.outer);
        root.draw();
    }
    addSmw(t: LayoutTabs) {
        this.root.items.push(t);
        this.root.draw();
        t.parent = this.root;
    }
}
export function hasTouchSupport(): boolean {
    return (
        'ontouchstart' in window ||          // Most touch devices
        navigator.maxTouchPoints > 0 ||      // Modern browsers/devices
        (navigator as any).msMaxTouchPoints > 0 // Older IE/Edge
    );
}
