<template>
  <div class="home-page">
    <h1 class="page-title">{{ user.name }}</h1>

    <el-descriptions title="個人設定" :column="2" size="40" border>
      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-s-custom"></i>
          ID
        </template>
        {{ user.id }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-place"></i>
          営業所
        </template>
        {{ getUnitName(user.unitcode) }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-place"></i>
          組織
        </template>
        {{ getOrganizationName(user.organizationcode) }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-tickets"></i>
          権限
        </template>
        {{ getRoleName(user.roleid) }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-star-off"></i>
          職種
        </template>
        {{ getOccupationName(user.occupationcode) }}
      </el-descriptions-item>

      <el-descriptions-item>
        <template slot="label">
          <i class="el-icon-s-help"></i>
          役職
        </template>
        {{ getJobTitleName(user.jobtitlecode) }}
      </el-descriptions-item>
    </el-descriptions>

    <DateUtils />

<div class="chart-wrap">
  <div class="chart-title">
    当月IRダッシュボード
    <span v-if="dashboardData.startDate && dashboardData.endDate" class="chart-subtitle">
      （{{ dashboardData.startDate }} ～ {{ dashboardData.endDate }}）
    </span>
  </div>

  <!-- グラフ -->
  <div v-loading="chartLoading" ref="builderChart" class="chart"></div>

  <!-- ★ここに追加★ -->
  <div class="chart-summary-row">
    <div class="chart-summary-card">
      <div class="summary-label">総件数</div>
      <div class="summary-value">{{ formatNumber(totalCount) }}件</div>
    </div>

    <div class="chart-summary-card">
      <div class="summary-label">IR対応費用合計</div>
      <div class="summary-value">¥{{ formatNumber(totalExpense) }}</div>
    </div>
  </div>

</div>
  </div>
</template>

<script>
import DateUtils from "./DateUtils";
import * as echarts from "echarts";

export default {
  name: "Home",
  components: { DateUtils },

  data() {
    return {
      user: {},
      chart: null,
      unitList: [],
      authorityList: [],
      chartLoading: false,
      dashboardData: {
        startDate: "",
        endDate: "",
        countList: [],
        expenseList: []
      },
          totalCount: 0,
    totalExpense: 0
    };
  },

  methods: {
    init() {
      const curUser = sessionStorage.getItem("CurUser");
      this.user = curUser ? JSON.parse(curUser) : {};
    },

    loadUnits() {
      this.$axios
        .get(this.$httpUrl + "/unit/list")
        .then(res => {
          this.unitList = res.data || [];
        })
        .catch(err => {
          console.error("Unit取得失敗:", err);
          this.unitList = [];
        });
    },

    loadAuthorities() {
      this.$axios
        .get(this.$httpUrl + "/m-authority/list")
        .then(res => {
          this.authorityList = res.data || [];
        })
        .catch(err => {
          console.error("Authority取得失敗:", err);
          this.authorityList = [];
        });
    },

    getUnitName(unitcode) {
      const unit = this.unitList.find(item => item.unitcode == unitcode);
      return unit ? unit.name : "不明";
    },

    getOrganizationName(code) {
      const item = this.authorityList.find(row => row.organizationcode == code);
      return item ? item.columnName : "不明";
    },

    getRoleName(code) {
      const item = this.authorityList.find(row => row.roleid == code);
      return item ? item.rolenm : "不明";
    },

    getOccupationName(code) {
      const item = this.authorityList.find(row => row.occupationcode == code);
      return item ? item.occupationnm : "不明";
    },

    getJobTitleName(code) {
      const item = this.authorityList.find(row => row.jobtitlecode == code);
      return item ? item.jobtitlenm : "不明";
    },

    getCurrentMonthRange() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const formatDate = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay)
      };
    },

    formatNumber(value) {
      const num = Number(value || 0);
      return num.toLocaleString("ja-JP");
    },

    loadDashboardData() {
      const range = this.getCurrentMonthRange();
      this.chartLoading = true;

      this.$axios
        .get(this.$httpUrl + "/record/dashboardSummary", {
          params: {
            startDate: range.startDate,
            endDate: range.endDate
          }
        })
        .then(res => res.data)
.then(res => {
  if (res.code === 200) {
    this.dashboardData = res.data || {
      startDate: range.startDate,
      endDate: range.endDate,
      countList: [],
      expenseList: []
    };

    this.totalCount = (this.dashboardData.countList || []).reduce((sum, item) => {
      return sum + Number(item.totalCount || 0);
    }, 0);

    this.totalExpense = (this.dashboardData.expenseList || []).reduce((sum, item) => {
      return sum + Number(item.totalExpense || 0);
    }, 0);

    this.initBuilderChart();
  } else {
    this.$message.error("ダッシュボードデータ取得失敗");
  }
})
        .catch(err => {
          console.error("ダッシュボードデータ取得失敗:", err);
          this.$message.error("ダッシュボードデータ取得に失敗しました");
        })
        .finally(() => {
          this.chartLoading = false;
        });
    },

    initBuilderChart() {
      const el = this.$refs.builderChart;
      if (!el) return;

      if (this.chart) {
        this.chart.dispose();
        this.chart = null;
      }

      this.chart = echarts.init(el);

      const countList = this.dashboardData.countList || [];
      const expenseList = this.dashboardData.expenseList || [];

      const countNames = countList.map(item => item.centerName);
      const countValues = countList.map(item => Number(item.totalCount || 0));

      const expenseNames = expenseList.map(item => item.centerName);
      const expenseValues = expenseList.map(item => Number(item.totalExpense || 0));

      const option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: (params) => {
            let html = "";
            params.forEach(item => {
              if (item.seriesName === "件数") {
                html += `${item.marker}${item.name} : ${this.formatNumber(item.value)} 件<br/>`;
              } else if (item.seriesName === "費用") {
                html += `${item.marker}${item.name} : ¥${this.formatNumber(item.value)}<br/>`;
              }
            });
            return html;
          }
        },
        title: [
          {
            text: "営業所別 IR件数",
            left: "25%",
            top: 20,
            textAlign: "center"
          },
          {
            text: "営業所別 IR対応費用",
            left: "75%",
            top: 20,
            textAlign: "center"
          }
        ],
        grid: [
          {
            top: 80,
            left: "5%",
            width: "40%",
            bottom: 40,
            containLabel: true
          },
          {
            top: 80,
            left: "55%",
            width: "40%",
            bottom: 40,
            containLabel: true
          }
        ],
        xAxis: [
          {
            type: "value",
            gridIndex: 0,
            splitLine: {
              show: true
            }
          },
          {
            type: "value",
            gridIndex: 1,
            splitLine: {
              show: true
            },
            axisLabel: {
              formatter: (value) => this.formatNumber(value)
            }
          }
        ],
        yAxis: [
          {
            type: "category",
            gridIndex: 0,
            data: countNames,
            axisLabel: {
              interval: 0
            }
          },
          {
            type: "category",
            gridIndex: 1,
            data: expenseNames,
            axisLabel: {
              interval: 0
            }
          }
        ],
        series: [
          {
            name: "件数",
            type: "bar",
            xAxisIndex: 0,
            yAxisIndex: 0,
            label: {
              show: true,
              position: "right",
              formatter: ({ value }) => `${this.formatNumber(value)}`
            },
            data: countValues
          },
          {
            name: "費用",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            label: {
              show: true,
              position: "right",
              formatter: ({ value }) => this.formatNumber(value)
            },
            data: expenseValues
          }
        ]
      };

      this.chart.setOption(option);
      window.addEventListener("resize", this.handleResize);
    },

    handleResize() {
      if (this.chart) {
        this.chart.resize();
      }
    }
  },

  created() {
    this.init();
  },

  mounted() {
    this.loadUnits();
    this.loadAuthorities();
    this.loadDashboardData();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  }
};
</script>

<style scoped>
.home-page {
  text-align: center;
  background-color: rgb(255, 255, 255);
  min-height: 100%;
  padding: 0;
  margin: 0;
}

.page-title {
  font-size: 50px;
}

.el-descriptions {
  width: 90%;
  margin: 0 auto;
  text-align: center;
}

.chart-wrap {
  width: 90%;
  margin: 24px auto 40px auto;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
}

.chart-title {
  padding: 10px 12px;
  text-align: left;
  font-weight: bold;
  background: rgba(0, 0, 0, 0.04);
}

.chart-subtitle {
  margin-left: 8px;
  font-size: 13px;
  color: #666;
  font-weight: normal;
}

.chart {
  width: 100%;
  height: 650px;
}

.chart-summary-row {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 0 24px 24px;
  flex-wrap: wrap;
}

.chart-summary-card {
  min-width: 260px;
  background: #f7f8fa;
  border-radius: 10px;
  padding: 16px 24px;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.summary-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
}

.summary-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
}
</style>