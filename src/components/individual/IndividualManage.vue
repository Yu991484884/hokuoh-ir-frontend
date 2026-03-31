<template>
  <div class="person-chart-page">
    <div class="page-card">
      <!-- 検索エリア -->
      <div class="filter-panel">
        <div class="filter-grid">
          <div class="filter-item">
            <label class="filter-label">営業所</label>
            <el-select
              v-model="affiliationcode"
              placeholder="営業所選択"
              clearable
              filterable
              class="full-width"
            >
<el-option
  v-for="item in centerNameOptions"
  :key="item"
  :label="item"
  :value="item"
/>
            </el-select>
          </div>

          <div class="filter-item">
            <label class="filter-label">対象日</label>
            <el-date-picker
              v-model="today"
              type="daterange"
              range-separator="To"
              start-placeholder="開始日"
              end-placeholder="終了日"
              class="full-width"
            />
          </div>
        </div>

        <div class="toolbar">
          <div class="toolbar-left">
            <el-button type="primary" icon="el-icon-search" @click="loadEchartsDataNew">
              検索
            </el-button>
          </div>

          <div class="toolbar-right">
            <el-button type="warning" icon="el-icon-download" @click="exportToExcel">
              Excel出力
            </el-button>
          </div>
        </div>
      </div>

      <!-- グラフ表示エリア -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">個人別IR件数</div>
          <div class="chart-subtitle">担当者ごとのIR件数を棒グラフで表示</div>
        </div>

        <div id="bie" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
import axios from "axios";
import * as XLSX from "xlsx";

export default {
  name: "EchartsComponent",
data() {
  return {
    centerNameOptions: [],
    authorityOptionsLoaded: false,
    affiliationcode: "",
    today: [],
    myChart: null,
    chartData: []
  };
},

mounted() {
  this.initChart();
  this.ensureAuthorityOptions();
  window.addEventListener("resize", this.handleResize);
},

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
  },

  methods: {
    handleResize() {
      if (this.myChart) {
        this.myChart.resize();
      }
    },

ensureAuthorityOptions() {
  if (this.authorityOptionsLoaded) {
    return;
  }

  axios
    .get(this.$httpUrl + "/m-authority/options")
    .then(response => {
      const data = response.data.data || {};
      this.centerNameOptions = data.centerNameList || [];
      this.authorityOptionsLoaded = true;
    })
    .catch(error => {
      console.error("営業所一覧取得失敗:", error);
      this.$message.error("営業所一覧の取得に失敗しました");
    });
},

    initChart() {
      const chartDom = document.getElementById("bie");
      if (!chartDom) return;

      this.myChart = echarts.init(chartDom);
      this.setChartOption([]);
    },

    setChartOption(data) {
      const option = {
        title: {
          text: "個人別IR件数",
          left: "center",
          top: 10,
          textStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: "#303133"
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        legend: {
          top: 45,
          left: "center",
          data: ["件数"],
          textStyle: {
            color: "#606266",
            fontSize: 12
          }
        },
        toolbox: {
          show: true,
          right: 20,
          top: 20,
          feature: {
            dataView: { show: true, readOnly: true },
            magicType: { show: true, type: ["line", "bar"] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        grid: {
          left: 60,
          right: 40,
          top: 95,
          bottom: 110,
          containLabel: true
        },
        xAxis: [
          {
            type: "category",
            data: data.map(item => item.causeperson),
            axisPointer: {
              type: "shadow"
            },
            axisLabel: {
              interval: 0,
              rotate: 30,
              color: "#606266"
            },
            axisLine: {
              lineStyle: {
                color: "#c0c4cc"
              }
            }
          }
        ],
        yAxis: [
          {
            type: "value",
            name: "件数",
            min: 0,
            axisLabel: {
              formatter: "{value}",
              color: "#606266"
            },
            splitLine: {
              lineStyle: {
                type: "dashed",
                color: "#e4e7ed"
              }
            }
          }
        ],
        series: [
          {
            name: "件数",
            type: "bar",
            data: data.map(item => item.count),
            label: {
              show: true,
              position: "inside",
              formatter: function (params) {
                return `件数：${params.value}`;
              },
              fontSize: 11
            },
            emphasis: {
              focus: "series"
            }
          }
        ]
      };

      this.myChart.setOption(option, true);
      this.myChart.resize();
    },

    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = ("0" + (d.getMonth() + 1)).slice(-2);
      const day = ("0" + d.getDate()).slice(-2);
      return `${year}-${month}-${day}`;
    },

    loadEchartsDataNew() {
      if (!this.affiliationcode || !this.today.length) {
        this.$message.error("営業所と日付を選択してください");
        return;
      }

      axios
        .get(this.$httpUrl + "/record/echartsDataNew", {
          params: {
            affiliationcode: this.affiliationcode,
            startDate: this.formatDate(this.today[0]),
            endDate: this.formatDate(this.today[1])
          }
        })
        .then(response => {
          this.chartData = response.data.data || [];
          this.setChartOption(this.chartData);
        })
        .catch(error => {
          console.error("Error loading data:", error);
          this.$message.error("グラフデータの取得に失敗しました");
        });
    },

    exportToExcel() {
      if (!this.affiliationcode || !this.today.length) {
        this.$message.error("営業所と日付を選択してください");
        return;
      }

      axios
        .get(this.$httpUrl + "/record/echartsDataNew", {
          params: {
            affiliationcode: this.affiliationcode,
            startDate: this.formatDate(this.today[0]),
            endDate: this.formatDate(this.today[1])
          }
        })
        .then(response => {
          const data = response.data.data || [];

          const wsData = [
            ["担当者", "件数"],
            ...data.map(item => [item.causeperson, item.count])
          ];

          const ws = XLSX.utils.aoa_to_sheet(wsData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

          const startDateStr = this.formatDate(this.today[0]).replace(/-/g, "");
          const endDateStr = this.formatDate(this.today[1]).replace(/-/g, "");
          const filename = `${startDateStr}-${endDateStr}-${this.affiliationcode}-個人別IR件数.xlsx`;

          XLSX.writeFile(wb, filename);
        })
        .catch(error => {
          console.error("Error exporting to Excel:", error);
          this.$message.error("Excel出力に失敗しました");
        });
    }
  }
};
</script>

<style scoped>
.person-chart-page {
  padding: 20px;
  background: #f7f8fa;
  min-height: 100%;
  box-sizing: border-box;
}

.page-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.filter-panel {
  margin-bottom: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.full-width {
  width: 100%;
}

.chart-card {
  background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
  border: 1px solid #ebeef5;
  border-radius: 14px;
  padding: 20px;
}

.chart-header {
  margin-bottom: 12px;
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
}

.chart-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
}

.chart-box {
  width: 100%;
  height: 700px;
}

@media screen and (max-width: 768px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .chart-box {
    height: 520px;
  }
}
</style>