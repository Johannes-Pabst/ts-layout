import './style.css'
import { LayoutItem } from './ts-layout/layout-item';
import { LayoutDir, LayoutList } from './ts-layout/layout-list';
import { LayoutManager } from './ts-layout/layout-manager'
import { LayoutTabs } from './ts-layout/layout-tabs';
import $ from 'jquery';

let layout = new LayoutManager($("body"), new LayoutItem("1",$("<div>1</div>")));
(<LayoutTabs>layout.root.items[0]).add(LayoutDir.V, 1, [new LayoutItem("2",$("<div>2</div>"))]);
(<LayoutTabs>layout.root.items[0].items[1]).add(LayoutDir.H, 1, [new LayoutItem("3",$("<div>3</div>"))]);
(<LayoutTabs>(<LayoutList>layout.root.items[0].items[1]).items[0]).add(LayoutDir.H, 1, [new LayoutItem("4",$("<div>4</div>"))]);
