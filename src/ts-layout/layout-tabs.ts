import { LayoutItem } from "./layout-item";
import { LayoutDir, LayoutList } from "./layout-list";
import $ from "jquery";
import { hasTouchSupport, LayoutManager } from "./layout-manager";

export class LayoutTabs {
    outer: JQuery<HTMLElement>;
    middle: JQuery<HTMLElement>;
    inner: JQuery<HTMLElement>;
    overlay: JQuery<HTMLElement>;
    dropArea: JQuery<HTMLElement>;
    innerDivs: JQuery<HTMLElement>[] = [];
    header: JQuery<HTMLElement>;
    tabs: JQuery<HTMLElement>;
    icons: JQuery<HTMLElement>;
    popout: JQuery<HTMLElement>;
    fullscreen: JQuery<HTMLElement>;
    endFullscreen: JQuery<HTMLElement>;
    active: number = 0;
    minWith: number = 50;
    minHeight: number = 50;
    inRootWindow: boolean = true;
    inFullScreen:boolean=false;
    constructor(public items: LayoutItem[], public parent: LayoutList, public manager: LayoutManager) {
        this.outer = $("<div></div>");
        this.outer.addClass("layout-tabs-outer");
        this.header = $("<div></div>");
        this.header.addClass("layout-tabs-header");
        let mu = () => {
            if (this.manager.dragged != undefined) {
                $(".layout-tabs-overlay").addClass("layout-tabs-overlay-inactive");
                $(".layout-tabs-drop-area").removeClass("layout-tabs-drop-area-left layout-tabs-drop-area-right layout-tabs-drop-area-top layout-tabs-drop-area-bottom");
                this.manager.completeDrag();
                this.items.push(this.manager.dragged);
                this.manager.dragged = undefined;
                this.draw();
                this.setActive(this.items.length - 1);
            }
        };
        this.header.on("mouseup", mu)
        this.header.on("customtouchend", mu)
        this.tabs = $("<div></div>");
        this.tabs.addClass("layout-tabs-tabs");
        this.header.append(this.tabs);
        this.icons = $("<div></div>");
        this.icons.addClass("layout-tabs-icons");
        this.header.append(this.icons);
        this.popout = $('<svg class="layout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="var(--color-icon)" style="display: flex; align-items: center;"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path></svg>');
        this.popout.addClass("layout-tabs-popout");
        this.icons.append(this.popout);
        if(hasTouchSupport()) {
            this.popout.css("display", "none");
        }
        this.fullscreen=$('<svg class="layout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--color-icon)" style="display: flex; align-items: center;"><path d="M0 0h24v24H0z" fill="none"></path><path stroke="var(--color-icon)" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"></path></svg>')
        this.fullscreen.addClass("layout-tabs-fullscreen");
        this.icons.append(this.fullscreen);
        this.endFullscreen=$('<svg class="layout-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--color-icon)" style="display: flex; align-items: center;"><path d="M0 0h24v24H0z" fill="none"></path><path stroke="var(--color-icon)" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"></path></svg>')
        this.endFullscreen.addClass("layout-tabs-end-fullscreen");
        this.icons.append(this.endFullscreen);
        this.endFullscreen.css("display", "none");
        this.popout.on("click", () => {
            this.fullscreen.css("display", "none");
            let pc = this.parent.percentages[this.parent.items.indexOf(this)];
            this.parent.percentages.splice(this.parent.items.indexOf(this), 1);
            this.parent.innerDivs.splice(this.parent.items.indexOf(this), 1);
            this.parent.items.splice(this.parent.items.indexOf(this), 1);
            for (let i = 0; i < this.parent.percentages.length; i++) {
                this.parent.percentages[i] += pc / this.parent.percentages.length;
            }
            this.parent.draw();
            const newWin = window.open("", "_blank", "width=600,height=400")!;
            newWin.document.writeln(`
                <html class="newwin">
                    <head>
                        <title>New Window</title>
                        <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                </style>
                    </head>
                    <body class="newwin">
                    </body>
                </html>
            `);
            newWin.document.close();
            ["/src/ts-layout/layout.css", "/src/ts-layout/newwin.css", "/src/ts-layout/style.css"].forEach((href) => {
                const link = newWin.document.createElement("link");
                link.rel = "stylesheet";
                link.href = href;
                newWin.document.head.appendChild(link);
            })
            $(newWin).on("load", () => {
                this.popout.css("display", "none");
                this.inRootWindow = false;
                $(newWin).on("beforeunload", () => {
                    this.manager.addSmw(this);
                    this.inRootWindow = true;
                    if(!hasTouchSupport()){
                        this.popout.css("display", "unset");
                    }
                    this.fullscreen.css("display", "unset");
                })
                $(newWin.document.body).append(this.outer);
            });
        });
        this.fullscreen.on("click",()=>{
            this.inFullScreen=true;
            this.fullscreen.css("display","none")
            this.popout.css("display","none")
            this.parent.innerDivs[this.parent.items.indexOf(this)].children().detach();
            this.manager.overlay.append(this.outer);
            this.manager.inner.css("display","none")
            this.endFullscreen.css("display","unset")
        })
        this.endFullscreen.on("click",()=>{
            this.endFullscreen.css("display","none")
            this.manager.overlay.children().detach();
            this.parent.innerDivs[this.parent.items.indexOf(this)].append(this.outer);
            this.manager.inner.css("display","unset")
            this.fullscreen.css("display","unset")
            this.popout.css("display","unset")
            this.inFullScreen=false;
        })
        this.outer.append(this.header);
        this.middle = $("<div></div>");
        this.middle.addClass("layout-tabs-middle");
        this.outer.append(this.middle);
        this.overlay = $("<div></div>");
        this.overlay.addClass("layout-tabs-overlay layout-tabs-overlay-inactive");
        this.middle.append(this.overlay);
        this.dropArea = $("<div></div>");
        this.dropArea.addClass("layout-tabs-drop-area");
        this.dropArea.append($("<div></div>").addClass("layout-tabs-drop-area-inner"));
        this.overlay.append(this.dropArea);
        let lastDir = LayoutDir.H;
        let lastd: 1 | -1 = 1;
        let hoverOverlay = (x: number, y: number) => {
            let o = this.overlay.offset();
            let w = this.overlay.width()!;
            let h = this.overlay.height()!;
            let px = (x - o!.left) / w * 2 - 1;
            let py = (y - o!.top) / h * 2 - 1;
            $(".layout-tabs-drop-area").removeClass("layout-tabs-drop-area-left layout-tabs-drop-area-right layout-tabs-drop-area-top layout-tabs-drop-area-bottom");
            if (Math.abs(px) > Math.abs(py)) {
                lastDir = LayoutDir.H;
                if (px > 0) {
                    lastd = 1;
                    this.dropArea.addClass("layout-tabs-drop-area-right");
                } else {
                    lastd = -1;
                    this.dropArea.addClass("layout-tabs-drop-area-left");
                }
            } else {
                lastDir = LayoutDir.V;
                if (py > 0) {
                    lastd = 1;
                    this.dropArea.addClass("layout-tabs-drop-area-bottom");
                } else {
                    lastd = -1;
                    this.dropArea.addClass("layout-tabs-drop-area-top");
                }
            }
        }
        this.overlay.on("mousemove", (e: JQuery.Event) => {
            hoverOverlay(e.clientX!, e.clientY!);
        });
        this.overlay.on("customtouchmove", (_: JQuery.Event, e2: JQuery.Event) => {
            hoverOverlay(e2.touches![0].clientX, e2.touches![0].clientY);
        });
        let dropOverlay = () => {
            if (this.manager.dragged != undefined) {
                $(".layout-tabs-overlay").addClass("layout-tabs-overlay-inactive");
                $(".layout-tabs-drop-area").removeClass("layout-tabs-drop-area-left layout-tabs-drop-area-right layout-tabs-drop-area-top layout-tabs-drop-area-bottom");
                this.manager.completeDrag();
                this.add(lastDir, lastd, [this.manager.dragged]);
                this.manager.dragged = undefined;
            }
        }
        this.overlay.on("mouseup", dropOverlay);
        this.overlay.on("customtouchend", dropOverlay);
        let leaveOverlay = () => {
            $(".layout-tabs-drop-area").removeClass("layout-tabs-drop-area-left layout-tabs-drop-area-right layout-tabs-drop-area-top layout-tabs-drop-area-bottom");
        }
        this.overlay.on("mouseleave", leaveOverlay);
        this.overlay.on("customtouchleave", leaveOverlay);
        this.inner = $("<div></div>");
        this.inner.addClass("layout-tabs-inner");
        this.inner.css("min-width", this.minWith + "px");
        this.inner.css("min-height", this.minHeight + "px");
        this.middle.append(this.inner);
        this.draw();
    }
    private draw() {
        this.innerDivs = [];
        this.tabs.empty();
        if (this.inner.children().length > 0) {
            this.inner.children().detach();
        }
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
            tab.text(this.items[i].name);
            this.tabs.append(tab);
            tab.on("click", () => {
                this.setActive(i);
            });
            let md = false;
            tab.on("mousedown", () => {
                md = true;
            });
            tab.on("customtouchstart", () => {
                md = true;
            });
            let mu = () => {
                md = false;
            };
            let mm = () => {
                if (md && this.manager.dragged == undefined && this.inRootWindow&&!this.inFullScreen) {
                    this.manager.dragged = item;
                    $(".layout-tabs-overlay").removeClass("layout-tabs-overlay-inactive");
                    this.items.splice(i, 1);
                    this.innerDivs[i].css("display", "none");
                    this.tabs.children().eq(i).css("display", "none");
                    this.overlay.css("display", "none");
                    if (this.items.length == 0) {
                        this.header.css("display", "none");
                        this.parent.innerDivs[this.parent.items.indexOf(this)].css("display", "hidden");
                    }
                    this.manager.outer.off("mousemove", mm);
                    tab.off("mousedown");
                    $(document).off("mouseup", mu);
                    let pc = this.parent.percentages[this.parent.items.indexOf(this)];
                    this.parent.percentages.splice(this.parent.items.indexOf(this), 1);
                    for (let i = 0; i < this.parent.percentages.length; i++) {
                        this.parent.percentages[i] += pc / this.parent.percentages.length;
                    }
                    this.manager.completeDrag = () => { this.draw() };
                    this.manager.outer.off("mousemove", mm);
                    this.manager.outer.off("customtouchmove", mm);
                }
            };
            this.manager.outer.on("mousemove", mm);
            this.manager.outer.on("customtouchmove", mm);
            $(document).on("mouseup", mu);
            $(document).on("customtouchend", mu);
        }
        this.setActive(this.active);
    }

    public add(hv: LayoutDir, bf: 1 | -1, items: LayoutItem[]) {
        let tid = this.parent.items.indexOf(this);
        if (this.parent.dir != hv) {
            this.parent.items[tid] = new LayoutList(hv, [this], this.parent, this.parent.manager);
            if (this.parent.innerDivs[tid].children().length > 0) {
                this.parent.innerDivs[tid].children().detach();
            }
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
        }
    }
    public setActive(index: number) {
        if (index < 0 || index >= this.items.length) return;
        this.active = index;
        for (let i = 0; i < this.innerDivs.length; i++) {
            if (i == index) {
                this.innerDivs[i].removeClass("layout-tab-hidden");
                this.tabs.children().eq(i).addClass("layout-tab-active");
            } else {
                this.innerDivs[i].addClass("layout-tab-hidden");
                this.tabs.children().eq(i).removeClass("layout-tab-active");
            }
        }
    }
}