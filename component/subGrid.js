import { BaseComponent } from '../component/baseComponent';
import { KendoGrid } from '../component/kendo/grid'
let eventBus = memoryStore.get('GlobalEvent');
export class SubGrid extends BaseComponent {
    constructor(opt) {
        super(opt);
        console.log(opt);
        this.gridEl = opt.gridEl;
        this.subGrid = null;
        this.pageable = opt.pageable;
        this.columns = opt.columns || [];
        this.change = opt.change || function () { };
        this.dataBound = opt.dataBound || function () { };
        this.subGridDataSource = opt.dataSource
    }
    initGrid() {
        console.log(this.subGridDataSource)
        let that = this;
        if (this.subGrid) {
            $(this.gridEl).data('kendoGrid').destroy();
            $(this.gridEl).empty();
        };
        let opt = {
            dataSource: this.subGridDataSource.dataSource,
            width: '400px',
            height: '300px',
            pageable: that.pageable,
            dataBound: function (e) {
                that.dataBound()
            },
            change: function (e) {
                that.change()
            },
            columns: this.columns
        };
        this.subGrid = new KendoGrid(this.gridEl, opt);
        this.subGrid.init();
    }
    refresh() {
        this.subGridDataSource.dataSource.read();
    }
    getSelected() {
        let kendoGrid = this.subGrid.instance;
        let selected = kendoGrid.select();
        let selectedData = [];
        for (let i = 0; i < selected.length; i++) {
            let t = selected[i];
            let tt = kendoGrid.dataItem(selected.eq(i));
            selectedData.push(tt);
        }
        return selectedData;
    }
    init() {
        let that = this;
        this.initGrid();
    }
}