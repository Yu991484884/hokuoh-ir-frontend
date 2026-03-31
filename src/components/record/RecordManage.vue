<template>
  <div class="record-manage-page">
    <div class="page-card">
      <!-- 検索エリア -->
      <div class="filter-panel">
        <div class="filter-grid">
          <div class="filter-item">
            <label class="filter-label">所属</label>

<el-select
  v-model="centernm"
  placeholder="所属選択"
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
            <label class="filter-label">要因別</label>
            <el-select
              v-model="factor"
              placeholder="要因選択"
              clearable
              filterable
              class="full-width"
            >
              <el-option
                v-for="(name, index) in factorNames"
                :key="index"
                :label="name"
                :value="name"
              />
            </el-select>
          </div>

          <div class="filter-item">
            <label class="filter-label">起因者</label>
            <el-input
              v-model="causeperson"
              placeholder="起因者検索"
              prefix-icon="el-icon-search"
              clearable
              @keyup.enter.native="loadPost"
            />
          </div>

          <div class="filter-item filter-item-wide">
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

<el-button
  type="primary"
  icon="el-icon-search"
  @click="handleSearch"
>
  検索
</el-button>

            <el-button
              icon="el-icon-refresh-left"
              @click="resetParam"
            >
              クリア
            </el-button>
          </div>

          <div class="toolbar-right">
<el-button
  type="warning"
  icon="el-icon-download"
  :loading="csvLoading"
  @click="exportToCsv"
>
  CSV出力
</el-button>
          </div>
        </div>
      </div>

      <!-- 上側スクロールバー -->
      <div
        class="top-scrollbar"
        ref="topScrollbar"
        @scroll="syncTopScroll"
      >
        <div
          class="top-scrollbar-inner"
          ref="topScrollbarInner"
        ></div>
      </div>

      <!-- テーブル -->
      <div
        class="table-scroll-wrap"
        ref="tableWrapper"
        @scroll="syncTableScroll"
      >
        <el-table
          :data="tableData"
          border
          stripe
          height="760"
          class="custom-table"
          :header-cell-style="{
            background: '#f5f7fa',
            color: '#303133',
            fontWeight: '600'
          }"
        >
          <el-table-column
            prop="no"
            label="ID"
            width="80"
            align="center"
          />
          <el-table-column
  label="登録日"
  width="120"
  align="center"
>
  <template slot-scope="scope">
    {{ formatCreateDate(scope.row.createtime) }}
  </template>
</el-table-column>

          <el-table-column
            prop="today"
            label="発生日"
            width="120"
            align="center"
          />
          <el-table-column
            prop="affiliationcode"
            label="所属"
            width="150"
          />
          <el-table-column
            prop="causeperson"
            label="起因者"
            width="110"
          />
          <el-table-column
            prop="corporateentity"
            label="企業体名"
            width="180"
          />
          <el-table-column
            prop="storename"
            label="店舗名"
            width="180"
          />
          <el-table-column
            prop="progress"
            label="経緯"
            width="300"
          />
          <el-table-column
            prop="reporter"
            label="報告者"
            width="120"
          />
          <el-table-column
            prop="factor"
            label="要因"
            width="180"
          />
          <el-table-column
            prop="correspondenceperson"
            label="対応者"
            width="110"
          />
          <el-table-column
            prop="correspondence"
            label="対応方法"
            width="180"
          />
          <el-table-column
            prop="countermeasure"
            label="対策"
            width="180"
          />
<el-table-column
  label="IR対応費用"
  width="90"
  align="right"
>
  <template slot-scope="scope">
    {{ formatExpenses(scope.row.expenses) }}
  </template>
</el-table-column>
          <el-table-column
            prop="adminuserid"
            label="登録者"
            width="120"
          />

          <el-table-column
  prop="centernm"
  label="IR計上先拠点"
  width="150"
/>

<el-table-column
  prop="filledinby"
  label="記入者"
  width="120"
/>

<el-table-column
  prop="merchandise"
  label="商品区分"
  width="120"
/>

<el-table-column
  prop="responsibility"
  label="社内外"
  width="100"
/>

          <el-table-column
            label="操作"
            width="180"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="success"
                plain
                @click="mod(scope.row)"
              >
                編集
              </el-button>

              <el-popconfirm
                title="本当に削除しますか？"
                @confirm="del(scope.row.no)"
              >
                <el-button
                  slot="reference"
                  size="mini"
                  type="danger"
                  plain
                  class="btn-delete"
                >
                  削除
                </el-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ページネーション -->
      <div class="pagination-wrap">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
        />
      </div>
    </div>

    <!-- 編集ダイアログ -->
    <el-dialog
      title="編集画面"
      :visible.sync="centerDialogVisible"
      width="760px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="custom-dialog"
    >
      <el-dialog
        width="75%"
        title="起因者選択"
        :visible.sync="innerVisible"
        append-to-body
        class="inner-dialog"
      >
        <SelectUser @doSelectUser="doSelectUser" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUser">確定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        width="75%"
        title="企業体選択"
        :visible.sync="innerVisible1"
        append-to-body
        class="inner-dialog"
      >
        <SelectCorporate @doSelectCorporate="doSelectCorporate" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisible1 = false">取消</el-button>
          <el-button type="primary" @click="confirmCorporate">確定</el-button>
        </span>
      </el-dialog>

      <el-dialog
        width="75%"
        title="営業所選択"
        :visible.sync="innerVisibleUnit"
        append-to-body
        class="inner-dialog"
      >
        <SelectUnit @doSelectUnit="doSelectUnit" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisibleUnit = false">取消</el-button>
          <el-button type="primary" @click="confirmUnit">確定</el-button>
        </span>
      </el-dialog>

      <el-form
        ref="form"
        :model="form"
        label-width="110px"
        class="custom-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="発生日">
              <el-date-picker
                v-model="form.today"
                type="date"
                placeholder="日付選択"
                class="full-width"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="要因名称">
              <el-input v-model="form.factor" readonly />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="起因者">
<el-input
  v-model="form.causeperson"
  readonly
  placeholder="クリックして選択"
 @click.native="selectUser('causeperson', 'form')"
/>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="所属">
              <el-input
                v-model="form.affiliationcode"
                readonly
                placeholder="クリックして選択"
                @click.native="selectUnit"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="企業体名">
              <el-input
                v-model="form.corporateentity"
                readonly
                placeholder="クリックして選択"
                @click.native="selectCorporate"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="店舗名">
              <el-input v-model="form.storename" />
            </el-form-item>
          </el-col>

<el-col :span="12">
  <el-form-item label="社内外">
    <el-select
      v-model="form.responsibility"
      placeholder="区分選択"
      class="full-width"
      @visible-change="handleAuthoritySelectOpen"
    >
      <el-option
        v-for="item in responsibilityOptions"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="区分">
    <el-select
      v-model="form.classification"
      placeholder="区分選択"
      class="full-width"
      @visible-change="handleAuthoritySelectOpen"
    >
      <el-option
        v-for="item in classificationOptions"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </el-form-item>
</el-col>
          <el-col :span="12">
            <el-form-item label="報告者">
              <el-input v-model="form.reporter" />
            </el-form-item>
          </el-col>

<el-col :span="12">
  <el-form-item label="温度帯">
    <el-select
      v-model="form.temperature"
      placeholder="温度帯選択"
      class="full-width"
      @visible-change="handleAuthoritySelectOpen"
    >
      <el-option
        v-for="item in temperatureOptions"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="IR計上拠点">
    <el-select
      v-model="form.centernm"
      placeholder="IR計上拠点"
      class="full-width"
      @visible-change="handleAuthoritySelectOpen"
    >
      <el-option
        v-for="item in centerNameOptions"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="商品区分">
    <el-select
      v-model="form.merchandise"
      placeholder="商品区分選択"
      class="full-width"
      @visible-change="handleAuthoritySelectOpen"
    >
      <el-option
        v-for="item in merchandiseOptions"
        :key="item"
        :label="item"
        :value="item"
      />
    </el-select>
  </el-form-item>
</el-col>



<el-col :span="24">
  <el-form-item label="写真">
    <div class="photo-view-block">
      <div v-if="form.photograph">
        <img
          :src="form.photograph"
          alt="写真"
          class="edit-photo-thumb"
          @click="previewImage(form.photograph)"
        />
        <div class="photo-tip">
          クリックすると拡大表示します
        </div>
      </div>
      <div v-else class="photo-empty">
        写真なし
      </div>
    </div>
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="IR対応費用">
    <el-input
      v-model="form.expenses"
      placeholder="例：1,200"
      clearable
      @input="formatEditExpenses"
    >
      <template slot="prepend">¥</template>
    </el-input>
  </el-form-item>
</el-col>

          <el-col :span="24">
            <el-form-item label="経緯">
              <el-input
                type="textarea"
                :rows="3"
                v-model="form.progress"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="対応方法">
              <el-input
                type="textarea"
                :rows="3"
                v-model="form.correspondence"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="対応者">
              <el-input v-model="form.correspondenceperson" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="対応策">
              <el-input
                type="textarea"
                :rows="3"
                v-model="form.countermeasure"
              />
            </el-form-item>
          </el-col>

<el-col :span="12">
  <el-form-item label="記入者">
    <el-input
      v-model="form.filledinby"
      readonly
      placeholder="クリックして選択"
     @click.native="selectUser('filledinby', 'form')"
    />
  </el-form-item>
</el-col>


        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">確定</el-button>
      </span>
    </el-dialog>

    <el-dialog
  title="写真閲覧"
  :visible.sync="imagePreviewVisible"
  width="900px"
  :close-on-click-modal="true"
  class="custom-dialog image-preview-dialog"
>
  <div class="image-preview-wrap">
    <img
      v-if="previewImageUrl"
      :src="previewImageUrl"
      alt="写真拡大"
      class="image-preview-large"
    />
  </div>
</el-dialog>


  </div>
</template>

<script>
import SelectUser from "../user/SelectUser";
import SelectCorporate from "../corporate/SelectCorporate";
import SelectUnit from "../unit/SelectUnit";

export default {
  name: "RecordManage",

  components: {
    SelectUser,
    SelectCorporate,
    SelectUnit
  },

data() {
  return {
    factorNames: [],
    unitNames: [],
    user: JSON.parse(sessionStorage.getItem("CurUser")),
    tableData: [],
    pageSize: 10,
    pageNum: 1,
    total: 0,
    name: "",
    affiliationcode: "",
    factor: "",
    today: [],
    causeperson: "",
    centerDialogVisible: false,
    innerVisible: false,
    innerVisible1: false,
    innerVisibleUnit: false,
    imagePreviewVisible: false,
    previewImageUrl: "",
    tempUser: {},
    tempCorporate: {},
    tempUnit: {},
    csvLoading: false,
    currentSelectType: "",
     currentSelectForm: "", 
        responsibilityOptions: [],
    classificationOptions: [],
    temperatureOptions: [],
    centerNameOptions: [],
merchandiseOptions: [],
    authorityOptionsLoaded: false,
        centernm: "",

    form: {
      no: "",
      today: "",
      classification: "",
      responsibility: "",
      storename: "",
      factor: "",
      reporter: "",
      corporateentity: "",
      affiliationcode: "",
      temperature: "",
      correspondence: "",
      correspondenceperson: "",
      countermeasure: "",
      progress: "",
      causeperson: "",
      userid: "",
      adminuserid: "",
      photograph: "",
      expenses: "",
        filledinby: "",
  filledinbyid: null,
    centernm: "",
  merchandise: ""
    }
  };
},
mounted() {
  this.ensureAuthorityOptions();
  this.fetchFactorNames();
  this.loadPost();

  this.$nextTick(() => {
    this.updateTopScrollbarWidth();
    window.addEventListener("resize", this.updateTopScrollbarWidth);
  });
},

  beforeDestroy() {
    window.removeEventListener("resize", this.updateTopScrollbarWidth);
  },

  methods: {
      handleAuthoritySelectOpen(visible) {
    if (visible) {
      this.ensureAuthorityOptions();
    }
  },

  handleSearch() {
  this.pageNum = 1;
  this.loadPost();
},
formatCreateDate(value) {
  if (!value) return "";
  const str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : str;
},
formatExpenses(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const num = Number(value);
  if (isNaN(num)) return value;

  return num.toLocaleString("ja-JP");
},

previewImage(url) {
  if (!url) {
    return;
  }
  this.previewImageUrl = url;
  this.imagePreviewVisible = true;
},
ensureAuthorityOptions() {
  if (this.authorityOptionsLoaded) {
    return;
  }

  this.$axios
    .get(this.$httpUrl + "/m-authority/options")
    .then(res => {
      const data = res.data.data || {};
      this.responsibilityOptions = data.responsibilityList || [];
      this.classificationOptions = data.classificationList || [];
      this.temperatureOptions = data.temperatureList || [];
      this.centerNameOptions = data.centerNameList || [];
      this.merchandiseOptions = data.merchandiseList || [];
      this.authorityOptionsLoaded = true;
    })
    .catch(() => {
      this.$message.error("選択肢の取得に失敗しました");
    });
},

formatEditExpenses(value) {
  let numeric = String(value || "").replace(/[^\d]/g, "");
  if (!numeric) {
    this.form.expenses = "";
    return;
  }

  this.form.expenses = Number(numeric).toLocaleString("ja-JP");
},
    syncTopScroll() {
      if (this.$refs.tableWrapper) {
        this.$refs.tableWrapper.scrollLeft = this.$refs.topScrollbar.scrollLeft;
      }
    },

    syncTableScroll() {
      if (this.$refs.topScrollbar) {
        this.$refs.topScrollbar.scrollLeft = this.$refs.tableWrapper.scrollLeft;
      }
    },

    updateTopScrollbarWidth() {
      this.$nextTick(() => {
        if (this.$refs.tableWrapper && this.$refs.topScrollbarInner) {
          this.$refs.topScrollbarInner.style.width =
            this.$refs.tableWrapper.scrollWidth + "px";
        }
      });
    },

async fetchAllRecordsForCsv() {
  const firstRes = await this.$axios.post(this.$httpUrl + "/record/listPageC1", {
    pageSize: this.pageSize,
    pageNum: 1,
    param: {
       centernm: this.centernm,
      factor: this.factor,
      causeperson: this.causeperson,
      today: this.today,
      userId: this.user.id + ""
    }
  });

  const firstData = firstRes.data;

  if (firstData.code !== 200) {
    throw new Error("1ページ目の取得に失敗しました");
  }

  const total = firstData.total || 0;
  const firstPageRecords = firstData.data || [];

  if (total === 0) {
    return [];
  }

  const totalPages = Math.ceil(total / this.pageSize);
  let allRecords = [...firstPageRecords];

  for (let page = 2; page <= totalPages; page++) {
    const res = await this.$axios.post(this.$httpUrl + "/record/listPageC1", {
      pageSize: this.pageSize,
      pageNum: page,
      param: {
        centernm: this.centernm,
        factor: this.factor,
        causeperson: this.causeperson,
        today: this.today,
        userId: this.user.id + ""
      }
    });

    const pageData = res.data;
    if (pageData.code === 200 && pageData.data) {
      allRecords = allRecords.concat(pageData.data);
    }
  }

  return allRecords;
},

async exportToCsv() {
  if (this.csvLoading) {
    return;
  }

  this.csvLoading = true;

  try {
    const allData = await this.fetchAllRecordsForCsv();

    if (!allData || allData.length === 0) {
      this.$message.warning("出力対象データがありません。");
      return;
    }

const headers = [
  "no",
  "today",
  "factor",
  "classification",
  "affiliationcode",
  "userid",
  "causeperson",
  "corporateentity",
  "storename",
  "progress",
  "reporter",
  "temperature",
  "correspondence",
  "correspondenceperson",
  "countermeasure",
  "countermeasurenone",
  "expenses",
    "responsibility",
        "centernm",
                "merchandise",
                                "filledinbyid",
                                "filledinby",
  "createtime",
  "updatetime",
  "adminuserid"
];

const headerLabels = [
  "ID",
  "発生日",
  "要因",
  "区分",
  "所属",
  "起因者ID",
  "起因者",
  "企業体名",
  "店舗名",
  "経緯",
  "報告者",
  "温度帯",
  "対応方法",
  "対応者",
  "対応策",
  "対応策記入有無",
  "IR対応費用",
    "社内外",
        "IR計上先拠点",
                "商品区分",
                                "記入者ID",
                                                "記入者",
  "作成日時",
  "更新日時",
  "登録者"
];

    const formatValue = (value) => {
      if (value === null || value === undefined) {
        return "";
      }
      return String(value);
    };

    const escapeCsv = (value) => {
      const str = formatValue(value);
      if (
        str.includes('"') ||
        str.includes(",") ||
        str.includes("\n") ||
        str.includes("\r")
      ) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvRows = [];
    csvRows.push(headerLabels.join(","));

    allData.forEach((row) => {
      const rowData = headers.map((key) => escapeCsv(row[key]));
      csvRows.push(rowData.join(","));
    });

    const csvContent = "\uFEFF" + csvRows.join("\r\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const startDate =
      this.today && this.today.length === 2 && this.today[0]
        ? this.today[0]
        : "開始日未指定";

    const endDate =
      this.today && this.today.length === 2 && this.today[1]
        ? this.today[1]
        : "終了日未指定";

    const fileName = `IR履歴-${startDate}-${endDate}.csv`;

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.$message.success(`CSV出力完了（${allData.length}件）`);
  } catch (e) {
    console.error("CSV出力エラー:", e);
    this.$message.error("CSV出力に失敗しました");
  } finally {
    this.csvLoading = false;
  }
},


resetForm() {
  this.form = {
    no: "",
    today: "",
    classification: "",
    responsibility: "",
    storename: "",
    factor: "",
    reporter: "",
    corporateentity: "",
    affiliationcode: "",
    temperature: "",
    correspondence: "",
    correspondenceperson: "",
    countermeasure: "",
    progress: "",
    causeperson: "",
    userid: "",
    adminuserid: "",
    photograph: "",
    expenses:"",
        filledinby: "",
    filledinbyid: null,
        centernm: "",
    merchandise: ""
  };

  this.$nextTick(() => {
    if (this.$refs.form) {
      this.$refs.form.clearValidate && this.$refs.form.clearValidate();
    }
  });
},

    handleSizeChange(val) {
      this.pageNum = 1;
      this.pageSize = val;
      this.loadPost();
    },

    handleCurrentChange(val) {
      this.pageNum = val;
      this.loadPost();
    },

    doSelectUser(val) {
      this.tempUser = val;
    },

    doSelectCorporate(val) {
      this.tempCorporate = val;
    },

    doSelectUnit(val) {
      this.tempUnit = val;
    },

    del(no) {
      this.$axios
        .get(this.$httpUrl + "/record/delete?no=" + no)
        .then((res) => res.data)
        .then((res) => {
          if (res.code == 200) {
            this.$message({
              message: "削除完了！",
              type: "success"
            });
            this.loadPost();
          } else {
            this.$message({
              message: "削除失敗！",
              type: "error"
            });
          }
        });
    },


    fetchFactorNames() {
      this.$axios
        .get(this.$httpUrl + "/factor/names")
        .then((response) => {
          this.factorNames = response.data.data || [];
        })
        .catch(() => {
          this.$message.error("要因一覧の取得に失敗しました");
        });
    },

confirmUser() {
  if (!this.tempUser || !this.tempUser.id) {
    this.$message.warning("社員を選択してください。");
    return;
  }

  if (this.currentSelectForm === "form1") {
    if (this.currentSelectType === "causeperson") {
      this.form1.causeperson = this.tempUser.name;
      this.form1.userid = this.tempUser.id;
    } else if (this.currentSelectType === "filledinby") {
      this.form1.filledinby = this.tempUser.name;
      this.form1.filledinbyid = this.tempUser.id;
    }
  } else if (this.currentSelectForm === "form") {
    if (this.currentSelectType === "causeperson") {
      this.form.causeperson = this.tempUser.name;
      this.form.userid = this.tempUser.id;
    } else if (this.currentSelectType === "filledinby") {
      this.form.filledinby = this.tempUser.name;
      this.form.filledinbyid = this.tempUser.id;
    }
  }

  this.innerVisible = false;
  this.currentSelectType = "";
  this.currentSelectForm = "";
},

    confirmCorporate() {
      this.form.corporateentity = this.tempCorporate.corporateentity;
      this.innerVisible1 = false;
    },

    confirmUnit() {
      this.form.affiliationcode = this.tempUnit.name;
      this.innerVisibleUnit = false;
    },
selectUser(type, formName) {
  this.currentSelectType = type;
  this.currentSelectForm = formName;
  this.innerVisible = true;
},

    selectCorporate() {
      this.innerVisible1 = true;
    },

    selectUnit() {
      this.innerVisibleUnit = true;
    },

    resetParam() {
        this.centernm = "";
      this.factor = "";
      this.causeperson = "";
      this.today = [];
      this.pageNum = 1;
      this.loadPost();
    },

    save() {
      if (!this.form.no) {
        this.$message.warning("IR新規登録画面から登録してください。");
        return;
      }
      this.doMod();
    },

doMod() {
  const submitData = {
    ...this.form,
    expenses: this.form.expenses
      ? this.form.expenses.toString().replace(/,/g, "")
      : ""
  };

  this.$axios
    .post(this.$httpUrl + "/record/update", submitData)
    .then((res) => res.data)
    .then((res) => {
      if (res.code == 200) {
        this.$message({
          message: "更新完了！",
          type: "success"
        });
        this.centerDialogVisible = false;
        this.loadPost();
        this.resetForm();
      } else {
        this.$message({
          message: "更新失敗です！",
          type: "error"
        });
      }
    })
    .catch(() => {
      this.$message.error("更新処理に失敗しました");
    });
},

loadPost() {
  this.$axios
    .post(this.$httpUrl + "/record/listPageC1", {
      pageSize: this.pageSize,
      pageNum: this.pageNum,
      param: {
        centernm: this.centernm,
        factor: this.factor,
        causeperson: this.causeperson,
        today: this.today,
        userId: this.user.id + ""
      }
    })
    .then((res) => res.data)
    .then((res) => {
      if (res.code == 200) {
        this.tableData = res.data || [];
        this.total = res.total || 0;

        // 総件数はあるのに当ページのデータが空の場合
        if (this.total > 0 && this.tableData.length === 0 && this.pageNum > 1) {
          this.pageNum = 1;
          this.loadPost();
          return;
        }

        this.$nextTick(() => {
          this.updateTopScrollbarWidth();
        });
      } else {
        this.$message.error("データ取得失敗");
      }
    })
    .catch(() => {
      this.$message.error("データ取得に失敗しました");
    });
},

mod(row) {
  this.centerDialogVisible = true;

  this.$nextTick(() => {
    this.form.no = row.no;
    this.form.today = row.today || "";
    this.form.classification = row.classification || "";
    this.form.responsibility = row.responsibility || "";
    this.form.storename = row.storename || "";
    this.form.factor = row.factor || "";
    this.form.reporter = row.reporter || "";
    this.form.corporateentity = row.corporateentity || "";
    this.form.affiliationcode = row.affiliationcode || "";
    this.form.temperature = row.temperature || "";
    this.form.centernm = row.centernm || "";
    this.form.merchandise = row.merchandise || "";
    this.form.correspondence = row.correspondence || "";
    this.form.correspondenceperson = row.correspondenceperson || "";
    this.form.countermeasure = row.countermeasure || "";
    this.form.progress = row.progress || "";
    this.form.causeperson = row.causeperson || "";
    this.form.userid = row.userid || "";
    this.form.adminuserid = row.adminuserid || "";
    this.form.photograph = row.photograph || "";
    this.form.filledinby = row.filledinby || "";
    this.form.filledinbyid = row.filledinbyid || null;
    this.form.expenses = row.expenses
      ? Number(String(row.expenses).replace(/,/g, "")).toLocaleString("ja-JP")
      : "";
  });
}
  }
};
</script>

<style scoped>
.record-manage-page {
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
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item-wide {
  grid-column: span 1;
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

.top-scrollbar {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  height: 16px;
  margin-bottom: 8px;
}

.top-scrollbar-inner {
  height: 1px;
  min-width: 2200px;
}

.table-scroll-wrap {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  min-width: 2200px;
  border-radius: 8px;
  overflow: hidden;
}

.btn-delete {
  margin-left: 8px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.full-width {
  width: 100%;
}

.custom-dialog /deep/ .el-dialog {
  border-radius: 14px;
  overflow: hidden;
}

.custom-dialog /deep/ .el-dialog__header {
  background: linear-gradient(90deg, #409eff, #66b1ff);
  padding: 18px 20px;
}

.custom-dialog /deep/ .el-dialog__title {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
}

.custom-dialog /deep/ .el-dialog__body {
  padding: 24px 24px 10px;
}

.inner-dialog /deep/ .el-dialog {
  border-radius: 14px;
  overflow: hidden;
}

.inner-dialog /deep/ .el-dialog__header {
  background: linear-gradient(90deg, #67c23a, #85ce61);
  padding: 16px 20px;
}

.inner-dialog /deep/ .el-dialog__title {
  color: #fff;
  font-size: 15px;
  font-weight: 600;
}

.custom-form /deep/ .el-form-item__label {
  font-weight: 600;
  color: #303133;
}

.custom-form /deep/ .el-input__inner,
.custom-form /deep/ .el-textarea__inner,
.custom-form /deep/ .el-select .el-input__inner {
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 10px 0 5px;
}

.dialog-footer .el-button {
  min-width: 100px;
  border-radius: 8px;
}

@media screen and (max-width: 1200px) {
  .filter-grid {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
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

  .pagination-wrap {
    justify-content: center;
  }
}

.table-photo-thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  cursor: pointer;
}

.photo-view-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-photo-thumb {
  max-width: 240px;
  max-height: 180px;
  object-fit: cover;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  display: block;
}

.photo-tip {
  font-size: 12px;
  color: #909399;
}

.photo-empty {
  color: #909399;
  font-size: 13px;
}

.image-preview-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.image-preview-large {
  max-width: 100%;
  max-height: 70vh;
  border-radius: 8px;
}


</style>