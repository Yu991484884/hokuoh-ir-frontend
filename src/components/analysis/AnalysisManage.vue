<template>
  <div class="chart-manage-page">
    <div class="page-card">
      <!-- 検索エリア -->
      <div class="filter-panel">
        <div class="filter-grid chart-filter-grid">
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
            <label class="filter-label">期間</label>
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
            <el-button type="primary" icon="el-icon-search" @click="loadData">
              検索
            </el-button>
          </div>

          <div class="toolbar-right">
            <el-button type="success" icon="el-icon-picture" @click="downloadImage">
              グラフ出力
            </el-button>
            <el-button type="warning" icon="el-icon-download" @click="downloadExcel">
              Excel出力
            </el-button>
          </div>
        </div>
      </div>

      <!-- グラフ表示エリア -->
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">IR統計分析</div>
          <div class="chart-subtitle">要因別の構成比グラフ</div>
        </div>

        <div id="bie" class="chart-box"></div>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas";
import axios from "axios";
import * as echarts from "echarts";
import * as XLSX from "xlsx";

export default {
  name: "Echarts",
data() {
  return {
    centerNameOptions: [],
    authorityOptionsLoaded: false,
    affiliationcode: "",
    today: [],
    pageNum: 1,
    pageSize: 10000,
    chartInstance: null
  };
},
mounted() {
  this.initBie();
  this.ensureAuthorityOptions();

  window.addEventListener("resize", this.handleResize);
},

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.chartInstance) {
      this.chartInstance.dispose();
      this.chartInstance = null;
    }
  },

  methods: {
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize();
      }
    },

    resetPageSize() {
      this.pageSize = 10000;
    },

    async loadData() {
      try {
        this.resetPageSize();

        const requestBody = {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          param: {
            affiliationcode: this.affiliationcode,
            today: this.today
          }
        };

        const response = await axios.post(this.$httpUrl + "/record/listPageC2", requestBody);
        const records =
          response &&
          response.data &&
          response.data.data &&
          response.data.data.records
            ? response.data.data.records
            : [];

        const total =
          response &&
          response.data &&
          response.data.data &&
          typeof response.data.data.total === "number"
            ? response.data.data.total
            : 0;

        this.updateChart(records);
        this.adjustPageSize(total);
      } catch (error) {
        console.error("Error loading data:", error);
        this.$message.error("グラフデータの取得に失敗しました");
      }
    },

    updateChart(data) {
      const chartDom = document.getElementById("bie");
      if (!chartDom) return;

      const myChart = this.chartInstance || echarts.init(chartDom);
      this.chartInstance = myChart;

      const seriesData = data.map(item => ({
        value: !isNaN(item.count) ? Number(item.count) : 0,
        name: item.factor
      }));

      const total = seriesData.reduce((sum, item) => sum + item.value, 0);

      const titleText = "IR統計分析 - 合計: " + total;

      const option = {
        title: {
          text: titleText,
          subtext: "要因別",
          left: "center",
          top: 10,
          textStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: "#303133"
          },
          subtextStyle: {
            fontSize: 12,
            color: "#909399"
          }
        },
        tooltip: {
          trigger: "item"
        },
        legend: {
          orient: "vertical",
          left: "left",
          top: "middle",
          itemGap: 14,
          textStyle: {
            fontSize: 13,
            color: "#606266"
          }
        },
        series: [
          {
            name: "IR統計分析",
            type: "pie",
            radius: ["35%", "65%"],
            center: ["68%", "52%"],
            data: seriesData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.25)"
              }
            },
            label: {
              show: true,
              formatter: "{b} ({d}%)"
            }
          }
        ]
      };

      myChart.setOption(option, true);
      myChart.resize();
    },

    adjustPageSize(totalRecords) {
      if (totalRecords > 1000) {
        this.pageSize = 1000;
      } else if (totalRecords > 500) {
        this.pageSize = 500;
      } else {
        this.pageSize = totalRecords || 10000;
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
      console.error("拠点一覧の取得失敗:", error);
      this.$message.error("営業所一覧の取得に失敗しました");
    });
},

    initBie() {
      const chartDom = document.getElementById("bie");
      if (!chartDom) return;

      this.chartInstance = echarts.init(chartDom);

      const option = {
        title: {
          text: "IR統計分析",
          subtext: "要因別",
          left: "center",
          top: 10,
          textStyle: {
            fontSize: 18,
            fontWeight: "bold",
            color: "#303133"
          },
          subtextStyle: {
            fontSize: 12,
            color: "#909399"
          }
        },
        tooltip: {
          trigger: "item"
        },
        legend: {
          orient: "vertical",
          left: "left",
          top: "middle",
          itemGap: 14,
          textStyle: {
            fontSize: 13,
            color: "#606266"
          }
        },
        series: [
          {
            name: "IR統計分析",
            type: "pie",
            radius: ["35%", "65%"],
            center: ["68%", "52%"],
            data: [],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.25)"
              }
            },
            label: {
              show: true,
              formatter: "{b} ({d}%)"
            }
          }
        ]
      };

      this.chartInstance.setOption(option);
    },

    downloadImage() {
      const now = new Date();
      const dateString = now.toISOString().split("T")[0].replace(/-/g, "");
      const filename = `${dateString}${this.affiliationcode ? "-" + this.affiliationcode : ""}-IR統計分析.png`;

      html2canvas(document.querySelector("#bie")).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imgData;
        link.download = filename;
        link.click();
      });
    },

    async downloadExcel() {
      if (!this.affiliationcode && !this.today.length) {
        this.$message.error("営業所と日付を選択してください");
        return;
      }
      if (!this.affiliationcode) {
        this.$message.error("営業所を選択してください");
        return;
      }
      if (!this.today.length) {
        this.$message.error("日付を選択してください");
        return;
      }

      try {
        const requestBody = {
          param: {
            affiliationcode: this.affiliationcode,
            today: this.today
          }
        };

        const response = await axios.post(this.$httpUrl + "/record/listPageC2", requestBody);
        const records = response.data.data.records || [];

        const data = [
          ["発生年月", "要因別", "実績件数"],
          ...records.map(item => [this.today[0], item.factor, item.count])
        ];

        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        const wsCols = ["A", "B", "C"];
        wsCols.forEach(col => {
          for (let row = 1; row <= data.length; row++) {
            const cell = ws[`${col}${row}`];
            if (cell) {
              cell.s = {
                font: {
                  name: "游ゴシック",
                  sz: 11,
                  color: { rgb: "000000" }
                }
              };
            }
          }
        });

        const filename = `${this.affiliationcode}-要因別.xlsx`;
        XLSX.writeFile(wb, filename);
      } catch (error) {
        console.error("Error downloading Excel:", error);
        this.$message.error("Excel出力に失敗しました");
      }
    }
  }
};
</script>

<style scoped>
.chart-manage-page {
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

.chart-filter-grid {
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
  margin-bottom: 10px;
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
  .chart-filter-grid {
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