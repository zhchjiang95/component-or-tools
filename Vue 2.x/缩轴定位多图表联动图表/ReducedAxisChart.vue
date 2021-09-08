<template>
  <div ref="wrapper" :class="{ 'chart-wrapper': true, full: isFull }">
    <div class="tools-bar">
      <div v-if="!hideToolbox" class="chart-title">
        图表{{ index }}
        <span>：{{ series.length }} 个参数</span>
      </div>
      <div v-if="!hideToolbox" class="chart-btn">
        <el-button
          type="text"
          icon="el-icon-full-screen"
          size="mini"
          @click="onFullscreen"
        >{{ isFull ? '退出全屏' : '全屏' }}</el-button>
        <el-button type="text" icon="el-icon-download" size="mini" @click="download">下载</el-button>
        <el-button
          v-show="!isFull"
          type="text"
          icon="el-icon-download"
          size="mini"
          @click="download('all')"
        >下载所有</el-button>
      </div>
    </div>
    <div class="chart-box" ref="chart"></div>
  </div>
</template>

<script>
// <ReducedAxisChart
//   hideToolbox
//   ref="hxChart"
//   v-if="options.total"
//   :options="options"
//   :series="series"
//   :legendName="legendNames"
//   :to="toNum"
//   @created="onCreated"
// />

import * as echarts from "echarts";
import screenfull from 'screenfull'

export default {
  props: {
    // 配置
    // {
    //     xAxis: {
    //       data: [],
    //     },
    //     pointData: [],
    //     total: 0,
    //     rest: {
    //       // darkMode: true,
    //       // backgroundColor: '#000'
    //     }
    //   }
    // }
    options: {
      type: Object,
      default: () => ({})
    },
    // 图表数据
    series: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      default: 0
    },
    // 动态隐藏或显示图例（某条折线图）
    legendName: {
      type: Object,
      default: () => ({})
    },
    // 隐藏工具栏
    hideToolbox: {
      type: Boolean,
      default: false,
    },
    // x轴定位到某个地方，须主动触发goto方法
    to: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isFull: false,
      cht: null,
      opt: {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: 'cross'
          },
          ...(this.options.tooltip || {}),
        },
        legend: {
          show: false,
          data: this.series.map(v => v.name)
        },
        grid: {
          top: 10,
          left: 0,
          right: 10,
          bottom: 38,
          containLabel: true,
          ...(this.options.grid || {}),
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: this.options.xAxis.data,
        },
        yAxis: {
          type: "value",
          axisLine: { show: true },
        },
        dataZoom: [
          {
            type: "inside",
            start: 0,
            end: this.options.dataZoom?.end || 10,
          },
          {
            start: 0,
            end: this.options.dataZoom?.end || 10,
          },
        ],
        series: [...this.series.map(v => ({
          name: v.name,
          type: "line",
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 1
          },
          data: v.data,
        })),
        {
          // 在x轴上标关键点
          type: 'scatter',
          markPoint: {
            symbol: 'circle',
            symbolSize: 10,
            label: {
              offset: [0, -10]
            },
            data: this.options.noPoint ? [] : this.options.pointData
          }
        }],
        ...(this.options.rest || {}),
      }
    };
  },
  mounted() {
    this.cht = echarts.init(this.$refs.chart)
    this.cht.setOption(this.opt)
    this.$emit('created', this.cht)
    window.addEventListener('resize', this.toggleFull, false)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.toggleFull, false)
  },
  watch: {
    legendName({ name }) {
      this.cht.dispatchAction({
        type: 'legendToggleSelect',
        // 图例名称
        name
      })
    }
  },
  methods: {
    // 通过 this.$refs.hxChart.goto() 调用定位到某点
    goto() {
      // 缩轴的范围0-100
      const p = {
        type: 'dataZoom',
        start: (this.to) / (this.options.total / 100),
        end: (this.to + 10) / (this.options.total / 100),
      }
      this.cht.dispatchAction(p)
      this.cht.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: this.to,
      })
    },
    onFullscreen() {
      screenfull.toggle(this.$refs.wrapper);
    },
    toggleFull() {
      const full = !!document.fullscreenElement
      if (this.isFull !== full) {
        this.isFull = full
        setTimeout(() => {
          this.cht.resize()
          setTimeout(() => {
            this.cht.resize()
          }, 0)
        }, 100)
      }
    },
    download(type) {
      const base64 = this.cht[type === 'all' ? 'getConnectedDataURL' : 'getDataURL']({
        type: 'png',
        backgroundColor: '#ffffff'
      })
      const url = URL.createObjectURL(this.base64ToBlob(base64))
      const a = document.createElement('a')
      a.href = url
      a.download = new Date().getTime() + '.png'
      a.click()
      URL.revokeObjectURL(url)
    },
    base64ToBlob(code) {
      const parts = code.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    },
  }
};
</script>

<style lang="scss" scoped>
.chart-wrapper {
  width: 100%;
  height: 100%;
  background: #fff;
  &.full {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 20px;
    .chart-box {
      margin-top: 20px;
      height: 600px !important;
    }
  }
  .tools-bar {
    width: 100%;
    height: 20px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;

    .chart-btn {
      ::v-deep .el-button--text {
        color: #777881;
      }
    }

    .chart-title {
      font-size: 12px;
      span {
        font-size: 10px;
        color: rgb(192, 196, 204);
      }
    }
  }
  .chart-box {
    width: 100%;
    height: 200px;
  }
}
</style>