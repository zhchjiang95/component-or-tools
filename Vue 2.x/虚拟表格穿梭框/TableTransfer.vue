<template>
  <div class="table-transfer" :style="{ height: height + 'px' }">
    <div class="left">
      <div class="t-t-title">
        <div>{{ titles[0] }}</div>
        <div class="quantity">{{ leftTable.checkedData.length + "/" + leftTable.allData.length }}</div>
      </div>
      <div class="search">
        <el-input
          v-model="leftTable.search"
          @input="onSearch('left')"
          size="mini"
          placeholder="实时搜索参数/参数中文名称"
        />
      </div>
      <div class="table-box">
        <vxe-table
          border
          show-overflow="title"
          highlight-hover-row
          ref="leftTable"
          :data="leftTable.allData"
          :height="xTableHeight"
          size="mini"
          @checkbox-all="selectChangeEvent('left', $event)"
          @checkbox-change="selectChangeEvent('left', $event)"
        >
          <vxe-table-column type="checkbox" fixed="left" width="40"></vxe-table-column>
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <vxe-table-column
            v-for="v in columns"
            :key="v.key"
            :field="v.key"
            :title="v.label"
            :width="v.width"
          />
        </vxe-table>
      </div>
    </div>
    <div class="transfer-btn">
      <div class="add">
        <el-button
          type="primary"
          size="mini"
          @click="deleteCheckedRow('left')"
          :disabled="!leftTable.checkedData.length"
        >
          {{
            buttonTexts[0]
          }}
          <i
            style="margin-left: 3px"
            class="el-icon-arrow-right"
          ></i>
        </el-button>
      </div>
      <div class="delete">
        <el-button
          type="primary"
          icon="el-icon-arrow-left"
          size="mini"
          @click="deleteCheckedRow('right')"
          :disabled="!rightTable.checkedData.length"
        >{{ buttonTexts[1] }}</el-button>
      </div>
    </div>
    <div class="right">
      <div class="t-t-title">
        <div>{{ titles[1] }}</div>
        <div class="quantity">{{ rightTable.checkedData.length + "/" + rightTable.allData.length }}</div>
      </div>
      <div class="search">
        <el-input
          v-model="rightTable.search"
          @input="onSearch('right')"
          size="mini"
          placeholder="实时搜索参数/参数中文名称"
        />
      </div>
      <div class="table-box">
        <vxe-table
          border
          show-overflow="title"
          highlight-hover-row
          ref="rightTable"
          :data="rightTable.allData"
          :height="xTableHeight"
          row-id="id"
          class="sortable-row"
          size="mini"
          @checkbox-all="selectChangeEvent('right', $event)"
          @checkbox-change="selectChangeEvent('right', $event)"
        >
          <!-- <vxe-table-column width="40">
            <template #default>
              <span class="drag-btn">
                <i class="el-icon-rank"></i>
              </span>
            </template>
            <template #header>
              <i class="vxe-icon--question" title="按住后上下拖动排序"></i>
            </template>
          </vxe-table-column>-->
          <vxe-table-column type="checkbox" fixed="left" width="40"></vxe-table-column>
          <vxe-table-column type="seq" width="60"></vxe-table-column>
          <!-- <vxe-table-column field="paramName" title="paramName" width="120"></vxe-table-column> -->
          <vxe-table-column
            v-for="v in columns"
            :key="v.key"
            :field="v.key"
            :title="v.label"
            :width="v.width"
          />
        </vxe-table>
      </div>
    </div>
  </div>
</template>

<script>
// <TableTransfer
//   :data="transferData"
//   :selectedData="selectedData"
//   :columns="columns"
//   :titles="['待选参数', '已选参数']"
//   transferKey="id"
//   :filterKey="['paramName', 'paramCnName']"
//   xTableHeight="228"
//   @change="onTransferChange"
// />

import Sortable from 'sortablejs'

export default {
  props: {
    // 左右表格key
    transferKey: {
      type: String,
      default: 'key'
    },
    // 实时搜索用到的字段，支持搜索多个
    filterKey: {
      type: Array,
      default: () => ['key']
    },
    // 所有数据
    data: {
      type: Array,
      default: () => [],
    },
    // 默认选中数据
    selectedData: {
      type: Array,
      default: () => [],
    },
    // 表格列信息
    // {
    //   key: "index",
    //   label: "序号",
    //   width: 100,
    // }
    columns: {
      type: Array,
      default: () => [],
    },
    titles: {
      type: Array,
      default: () => ["待选", "已选"],
    },
    buttonTexts: {
      type: Array,
      default: () => ["添加", "删除"],
    },
    // 穿梭框高
    height: {
      type: Number,
      default: 300,
    },
    // 设置启用虚拟滚动条
    xTableHeight: {
      type: String,
      default: "auto",
    },
  },
  data() {
    return {
      sortable: null,
      leftTable: {
        checkedData: [],
        allData: this.data.filter((v) =>
          this.selectedData.every((c) => c[this.transferKey] !== v[this.transferKey])
        ),
        bkData: this.data.filter((v) =>
          this.selectedData.every((c) => c[this.transferKey] !== v[this.transferKey])
        ),
        search: "",
      },
      rightTable: {
        checkedData: [],
        allData: this.selectedData,
        bkData: this.selectedData,
        search: "",
      },
    };
  },
  // created() {
  //   this.rowDrop()
  // },
  mounted() {
    // change事件，实时返回右侧数据
    this.$emit("change", this.selectedData);
  },
  beforeDestroy() {
    if (this.sortable) {
      this.sortable.destroy()
    }
  },
  watch: {
    data(newVal) {
      this.leftTable = {
        checkedData: [],
        allData: newVal,
        bkData: newVal,
        search: "",
      };
      this.rightTable = {
        checkedData: [],
        allData: [],
        bkData: [],
        search: "",
      };
      this.$emit("change", []);
    },
    selectedData(newVal) {
      const filterData = this.data.filter((v) =>
        this.selectedData.every((c) => c[this.transferKey] !== v[this.transferKey])
      )
      this.leftTable.allData = filterData
      this.leftTable.bkData = filterData
      this.rightTable.allData = newVal
      this.rightTable.bkData = newVal
      this.$emit("change", newVal);
    }
  },
  methods: {
    // 实时搜索
    onSearch(type) {
      // 左表格
      if (type === "left") {
        const s = this.leftTable.search;
        this.leftTable.checkedData = []
        this.$refs.leftTable.clearCheckboxRow();
        if (s) {
          this.leftTable.allData = this.leftTable.bkData.filter((v) =>
            this.filterKey.some(c => v[c].includes(s))
          );
        } else {
          this.filterTable();
        }
      } else {
        const s = this.rightTable.search;
        this.rightTable.checkedData = []
        this.$refs.rightTable.clearCheckboxRow();
        this.rightTable.allData = s
          ? this.rightTable.bkData.filter((v) => this.filterKey.some(c => v[c].includes(s)))
          : this.rightTable.bkData;
      }
    },
    selectChangeEvent(type, { records }) {
      if (type === "left") {
        this.leftTable.checkedData = records;
        return;
      }
      this.rightTable.checkedData = records;
    },
    // 添加或删除事件
    deleteCheckedRow(type) {
      // 左表格
      if (type === "left") {
        const selected = [
          ...this.rightTable.allData,
          ...this.leftTable.checkedData,
        ];
        this.rightTable.allData = selected;
        this.rightTable.bkData = selected;
        this.leftTable.checkedData = [];
        this.$refs.leftTable.clearCheckboxRow();
      } else {
        const selected = this.rightTable.bkData.filter((v) => {
          return this.rightTable.checkedData.every((c) => c[this.transferKey] !== v[this.transferKey]);
        });
        this.rightTable.allData = selected;
        this.rightTable.bkData = selected;
        this.rightTable.checkedData = [];
        this.$refs.rightTable.clearCheckboxRow();
      }
      this.filterTable();
      this.leftTable.search = "";
      this.rightTable.search = "";
      this.$emit("change", this.rightTable.allData);
    },
    // 过滤左表格数据
    filterTable() {
      const filterLeftTable = this.data.filter((v) => {
        return this.rightTable.allData.every((c) => c[this.transferKey] !== v[this.transferKey]);
      });
      this.leftTable.allData = filterLeftTable;
      this.leftTable.bkData = filterLeftTable;
    },
    // 拖拽排序
    rowDrop() {
      this.$nextTick(() => {
        const xTable = this.$refs.rightTable
        this.sortable = Sortable.create(xTable.$el.querySelector('.body--wrapper>.vxe-table--body tbody'), {
          handle: '.drag-btn',
          onEnd: ({ newIndex, oldIndex }) => {
            console.log(newIndex, oldIndex)
            // const tmp = this.rightTable.allData
            // const p = tmp[oldIndex]
            // const n = tmp[newIndex]
            // tmp.splice(newIndex, 1, p)
            // tmp.splice(oldIndex, 1, n)
            const currRow = this.rightTable.allData.splice(oldIndex, 1)[0]
            this.rightTable.allData.splice(newIndex, 0, currRow)
            // console.log(tmp.reduce((p, n) => p + ',' + n.paramName, ''))
            // this.$emit("change", this.rightTable.allData);
            // this.$forceUpdate()
          }
        })
      })
    }
  },
};
</script>

<style lang="scss" scoped>
.table-transfer {
  display: flex;
  .transfer-btn {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 0 4%;
    .add {
      margin-bottom: 16px;
    }
  }
  .left,
  .right {
    flex-grow: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .t-t-title {
      flex-shrink: 0;
      height: 36px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px;
      font-size: 15px;
      border-top-left-radius: 2px;
      border-top-right-radius: 2px;
      background: #dfe6ec;
      color: #893133;
    }
  }
  .search {
    flex-shrink: 0;
    padding: 0 8px 8px;
    background: #dfe6ec;
  }
  .table-box {
    flex-grow: 1;
    overflow: hidden;
  }
  .sortable-row {
    .drag-btn {
      cursor: move;
      font-size: 15px;
    }
    .vxe-body--row.sortable-ghost,
    .vxe-body--row.sortable-chosen {
      background-color: #dfecfb;
    }
  }
}
</style>