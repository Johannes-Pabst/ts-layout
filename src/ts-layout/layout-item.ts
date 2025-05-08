import $ from 'jquery';
import { LayoutTabs } from './layout-tabs';

export class LayoutItem {
    parent:LayoutTabs|undefined;
    constructor(public name:string,public div: JQuery<HTMLElement>=$("<div></div>")) {

    }
}
