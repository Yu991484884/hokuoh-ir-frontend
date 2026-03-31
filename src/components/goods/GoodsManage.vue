<template>
  <div class="goods-manage-page">
    <div class="page-card">
      <!-- 検索エリア -->
      <div class="toolbar">
        <div class="toolbar-left">
          <el-input
            v-model="factor"
            class="search-input"
            placeholder="要因名を入力してください"
            prefix-icon="el-icon-search"
            clearable
            @keyup.enter.native="loadPost"
          />
          <el-button type="primary" icon="el-icon-search" @click="loadPost">
            検索
          </el-button>
          <el-button icon="el-icon-refresh-left" @click="resetParam">
            クリア
          </el-button>
        </div>

        <div class="toolbar-right">
          <!-- 要因新規登録を使う場合は解除 -->
          <!-- <el-button type="primary" icon="el-icon-plus" @click="add">要因 新規</el-button> -->
          <el-button type="primary" icon="el-icon-plus" @click="inGoods">
            IR新規登録
          </el-button>
        </div>
      </div>

      <!-- テーブル -->
      <el-table
        :data="tableData"
        border
        stripe
        highlight-current-row
        class="custom-table"
        :header-cell-style="{
          background: '#f5f7fa',
          color: '#303133',
          fontWeight: '600'
        }"
        @current-change="selectCurrentChange"
      >
        <el-table-column prop="no" label="ID" width="80" align="center" />
        <el-table-column prop="id" label="管理番号" width="120" align="center" />
        <el-table-column prop="factor" label="要因名称" min-width="220" />
        <el-table-column prop="comment" label="備考" min-width="240" />
      </el-table>

      <!-- ページネーション -->
      <div class="pagination-wrap">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pageNum"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          background
        />
      </div>
    </div>

    <!-- 要因新規登録ダイアログ -->
    <el-dialog
      title="要因新規登録"
      :visible.sync="centerDialogVisible"
      width="560px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="custom-dialog"
    >
      <el-form
        ref="form"
        :rules="rules"
        :model="form"
        label-width="100px"
        class="custom-form"
      >
        <el-form-item label="管理番号" prop="id">
          <el-input v-model="form.id" placeholder="管理番号を入力" clearable />
        </el-form-item>

        <el-form-item label="要因名称" prop="factor">
          <el-input v-model="form.factor" placeholder="要因名称を入力" clearable />
        </el-form-item>

        <el-form-item label="備考" prop="comment">
          <el-input
            type="textarea"
            :rows="3"
            v-model="form.comment"
            placeholder="備考を入力"
          />
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="centerDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">確定</el-button>
      </span>
    </el-dialog>

    <!-- IR登録ダイアログ -->
    <el-dialog
      title="IR登録"
      :visible.sync="inDialogVisible"
      width="760px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="custom-dialog"
    >
      <!-- 起因者選択 -->
      <el-dialog
        width="75%"
        title="起因者選択"
        :visible.sync="innerVisible"
        append-to-body
        class="inner-dialog"
      >
        <SelectUser @doSelectUser="doSelectUser"></SelectUser>
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmUser">確定</el-button>
        </span>
      </el-dialog>

      <!-- 企業体選択 -->
      <el-dialog
        width="75%"
        title="企業体選択"
        :visible.sync="innerVisible1"
        append-to-body
        class="inner-dialog"
      >
        <SelectCorporate @doSelectCorporate="doSelectCorporate"></SelectCorporate>
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisible1 = false">取消</el-button>
          <el-button type="primary" @click="confirmCorporate">確定</el-button>
        </span>
      </el-dialog>

      <!-- 営業所選択 -->
      <el-dialog
        width="75%"
        title="営業所選択"
        :visible.sync="innerVisibleUnit"
        append-to-body
        class="inner-dialog"
      >
        <SelectUnit @doSelectUnit="doSelectUnit"></SelectUnit>
        <span slot="footer" class="dialog-footer">
          <el-button @click="innerVisibleUnit = false">取消</el-button>
          <el-button type="primary" @click="confirmUnit">確定</el-button>
        </span>
      </el-dialog>

      <el-form
        ref="form1"
        :rules="rules1"
        :model="form1"
        label-width="110px"
        class="custom-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="要因名称">
              <el-input v-model="form1.factor" readonly />
            </el-form-item>
          </el-col>

<el-col :span="12">
<el-form-item prop="today">
  <span slot="label"><span class="required-mark"></span>発生日</span>
    <el-date-picker
      v-model="form1.today"
      type="date"
      placeholder="日付選択"
      value-format="yyyy-MM-dd"
      format="yyyy-MM-dd"
      class="full-width"
    />
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item prop="causeperson">
    <span slot="label"><span class="required-mark"></span>起因者</span>
    <el-input
      v-model="form1.causeperson"
      readonly
      placeholder="クリックして選択"
      @click.native="selectUser('causeperson')"
    />
  </el-form-item>
</el-col>
          <el-col :span="12">
           <el-form-item prop="affiliationcode">
  <span slot="label"><span class="required-mark"></span>所属</span>
              <el-input
                v-model="form1.affiliationcode"
                readonly
                placeholder="クリックして選択"
                @click.native="selectUnit"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item prop="corporateentity">
  <span slot="label"><span class="required-mark"></span>企業体名</span>
              <el-input
                v-model="form1.corporateentity"
                readonly
                placeholder="クリックして選択"
                @click.native="selectCorporate"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="店舗名" prop="storename">
              <el-input v-model="form1.storename" />
            </el-form-item>
          </el-col>

<el-col :span="12">
  <el-form-item prop="responsibility">
    <span slot="label"><span class="required-mark"></span>社内外</span>
    <el-select v-model="form1.responsibility" placeholder="区分選択" class="full-width">
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
  <el-form-item prop="classification">
    <span slot="label"><span class="required-mark"></span>区分</span>
    <el-select v-model="form1.classification" placeholder="区分選択" class="full-width">
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
           <el-form-item prop="reporter">
  <span slot="label"><span class="required-mark"></span>報告者</span>
              <el-input v-model="form1.reporter" />
            </el-form-item>
          </el-col>

<el-col :span="12">
  <el-form-item label="温度帯">
    <el-select v-model="form1.temperature" placeholder="温度帯選択" class="full-width">
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
  <el-form-item label="IR計上拠点" prop="centernm">
    <el-select
      v-model="form1.centernm"
      placeholder="IR計上拠点"
      class="full-width"
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
  <el-form-item label="商品区分" prop="merchandise">
    <el-select
      v-model="form1.merchandise"
      placeholder="商品区分選択"
      class="full-width"
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


          <!-- 写真アップロード -->
<el-col :span="24">
  <el-form-item label="写真">
    <div class="photo-upload-block">
      <input
        type="file"
        accept="image/*"
        @change="handlePhotoChange"
      />

      <div v-if="selectedPhotoFile" class="photo-file-name">
        選択ファイル：{{ selectedPhotoFile.name }}
      </div>

      <div v-if="form1.photograph" class="photo-preview-wrap">
        <img
          :src="form1.photograph"
          alt="写真"
          class="photo-preview-img"
        />
      </div>

      <div v-if="selectedPhotoFile && !form1.photograph" class="photo-preview-actions">
        <el-button
          size="mini"
          type="danger"
          plain
          @click="removePhoto"
        >
          選択解除
        </el-button>
      </div>
    </div>
  </el-form-item>
</el-col>

<el-col :span="12">
  <el-form-item label="IR対応費用" prop="expenses">
    <el-input
      v-model="form1.expenses"
      placeholder="例：1,200"
      clearable
      @input="formatExpenses"
    />
  </el-form-item>
</el-col>

          <el-col :span="24">
        <el-form-item prop="progress">
  <span slot="label"><span class="required-mark"></span>経緯</span>
              <el-input type="textarea" :rows="3" v-model="form1.progress" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="対応方法" prop="correspondence">
              <el-input type="textarea" :rows="3" v-model="form1.correspondence" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="対応者" prop="correspondenceperson">
              <el-input v-model="form1.correspondenceperson" />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="対応策" prop="countermeasure">
              <el-input type="textarea" :rows="3" v-model="form1.countermeasure" />
            </el-form-item>
          </el-col>

<el-col :span="12">
  <el-form-item prop="filledinby">
    <span slot="label"><span class="required-mark"></span>記入者</span>
    <el-input
      v-model="form1.filledinby"
      readonly
      placeholder="クリックして選択"
      @click.native="selectUser('filledinby')"
    />
  </el-form-item>
</el-col>


        </el-row>
      </el-form>


      <span slot="footer" class="dialog-footer">
        <el-button @click="inDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="doInGoods">確定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import SelectUser from "../user/SelectUser";
import SelectCorporate from "../corporate/SelectCorporate";
import SelectUnit from "../unit/SelectUnit";

export default {
  name: "GoodsManage",
  components: { SelectUser, SelectCorporate, SelectUnit },
data() {
  return {
    user: JSON.parse(sessionStorage.getItem("CurUser")),
    storageData: [],
    goodstypeData: [],
    tableData: [],
    pageSize: 10,
    pageNum: 1,
    total: 0,
    factor: "",
    storage: "",
    goodstype: "",
    centerDialogVisible: false,
    inDialogVisible: false,
    innerVisible: false,
    innerVisible1: false,
    innerVisibleUnit: false,
    currentRow: {},
    tempUser: {},
    tempCorporate: {},
    tempUnit: {},
    selectedPhotoFile: null,
    photoUploading: false,
    currentSelectType: '', 
    centerNameOptions: [],
merchandiseOptions: [],
    form: {
      no: "",
      id: "",
      factor: "",
      comment: ""
    },
    form1: {
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
            filledinby: '',
      filledinbyid: null,
        centernm: "",
  merchandise: ""
    },
    rules1: {
  today: [
    { required: true, message: "発生日を選択してください", trigger: "change" }
  ],
  causeperson: [
    { required: true, message: "起因者を選択してください", trigger: "change" }
  ],
  affiliationcode: [
    { required: true, message: "営業所を選択してください", trigger: "change" }
  ],
  corporateentity: [
    { required: true, message: "企業体名を選択してください", trigger: "change" }
  ],
  responsibility: [
    { required: true, message: "社内外を選択してください", trigger: "change" }
  ],
  classification: [
    { required: true, message: "区分を選択してください", trigger: "change" }
  ],
  reporter: [
    { required: true, message: "報告者を入力してください", trigger: "blur" }
  ],
  progress: [
    { required: true, message: "経緯を入力してください", trigger: "blur" }
  ],
    filledinby: [
    { required: true, message: "記入者を選択してください", trigger: "change" }
  ],
  
},
    rules: {}
  };
},
methods: {
  formatExpenses(value) {
    const numeric = String(value || "").replace(/[^\d]/g, "");
    if (!numeric) {
      this.form1.expenses = "";
      return;
    }
    this.form1.expenses = numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },
handleSizeChange(size) {
  this.pageSize = size;
  this.pageNum = 1;   // サイズ変更時は1ページ目に戻す
  this.loadPost();
},

handleCurrentChange(page) {
  this.pageNum = page;
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

  confirmUser() {
    if (!this.tempUser || !this.tempUser.id) {
      this.$message.warning("社員を選択してください。");
      return;
    }

    if (this.currentSelectType === "causeperson") {
      this.form1.causeperson = this.tempUser.name;
      this.form1.userid = this.tempUser.id;
    } else if (this.currentSelectType === "filledinby") {
      this.form1.filledinby = this.tempUser.name;
      this.form1.filledinbyid = this.tempUser.id;
    }

    this.innerVisible = false;
    this.currentSelectType = "";
  },

  confirmCorporate() {
    this.form1.corporateentity = this.tempCorporate.corporateentity;
    this.innerVisible1 = false;
  },

  confirmUnit() {
    this.form1.affiliationcode = this.tempUnit.name;
    this.innerVisibleUnit = false;
  },

  selectCurrentChange(val) {
    this.currentRow = val || {};
  },

  resetForm() {
    this.form = {
      no: "",
      id: "",
      factor: "",
      comment: ""
    };

    this.$nextTick(() => {
      if (this.$refs.form) {
        this.$refs.form.clearValidate();
      }
    });
  },

  resetInForm() {
    this.form1 = {
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
    };

    this.selectedPhotoFile = null;
    this.photoUploading = false;
    this.tempUser = {};
    this.currentSelectType = "";

    this.$nextTick(() => {
      if (this.$refs.form1) {
        this.$refs.form1.clearValidate();
      }
    });
  },

  handlePhotoChange(event) {
    const file = event.target.files[0];
    if (!file) {
      this.selectedPhotoFile = null;
      return;
    }

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      this.$message.warning("画像ファイルを選択してください。");
      event.target.value = "";
      this.selectedPhotoFile = null;
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      this.$message.warning("ファイルサイズは10MB以下にしてください。");
      event.target.value = "";
      this.selectedPhotoFile = null;
      return;
    }

    this.selectedPhotoFile = file;
  },

  removePhoto() {
    this.form1.photograph = "";
    this.selectedPhotoFile = null;
  },

  loadAuthorityOptions() {
    this.$axios.get(this.$httpUrl + "/m-authority/options").then(res => {
      const data = res.data.data;
      this.responsibilityOptions = data.responsibilityList || [];
      this.classificationOptions = data.classificationList || [];
      this.temperatureOptions = data.temperatureList || [];
          this.centerNameOptions = data.centerNameList || [];
    this.merchandiseOptions = data.merchandiseList || [];
    });
  },

  inGoods() {
    if (!this.currentRow.no) {
      this.$message.warning("要因を選択してください。");
      return;
    }

    this.inDialogVisible = true;
    this.resetInForm();
    this.loadAuthorityOptions();

    this.$nextTick(() => {
      this.form1.factor = this.currentRow.factor;
      this.form1.adminuserid = this.user ? this.user.name : "";
    });
  },

  selectUser(type) {
    this.currentSelectType = type;
    this.innerVisible = true;
  },

  selectCorporate() {
    this.innerVisible1 = true;
  },

  selectUnit() {
    this.innerVisibleUnit = true;
  },

  doInGoods() {
    this.$refs.form1.validate(valid => {
      if (!valid) {
        this.$message.warning("必須項目を入力してください。");
        return;
      }

      const submitData = {
        ...this.form1,
        expenses: this.form1.expenses
          ? this.form1.expenses.toString().replace(/,/g, "")
          : null
      };

      const formData = new FormData();
      formData.append("recordJson", JSON.stringify(submitData));

      if (this.selectedPhotoFile) {
        formData.append("file", this.selectedPhotoFile);
      }

      this.$axios
        .post(this.$httpUrl + "/record/save", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
        .then(res => res.data)
        .then(res => {
          if (res.code == 200) {
            this.$message({
              message: "登録完了！",
              type: "success"
            });
            this.inDialogVisible = false;
            this.loadPost();
            this.resetInForm();
          } else {
            this.$message({
              message: res.msg || "登録失敗！",
              type: "error"
            });
          }
        })
        .catch(() => {
          this.$message({
            message: "登録処理に失敗しました！",
            type: "error"
          });
        });
    });
  },

  loadPost() {
    this.$axios
      .post(this.$httpUrl + "/factor/listPage", {
        pageSize: this.pageSize,
        pageNum: this.pageNum,
        param: {
          factor: this.factor
        }
      })
      .then(res => res.data)
      .then(res => {
        if (res.code == 200) {
          this.tableData = res.data;
          this.total = res.total;
        } else {
          this.$message.error("データ取得失敗");
        }
      })
      .catch(() => {
        this.$message.error("データ取得に失敗しました");
      });
  }
},
  beforeMount() {
  this.loadPost();
  this.loadAuthorityOptions();
  }
};
</script>

<style scoped>
.goods-manage-page {
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

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.search-input {
  width: 260px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
}

.full-width {
  width: 100%;
}

.photo-upload-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.photo-upload-btn {
  width: 150px;
}

.photo-preview-wrap {
  margin-top: 12px;
}

.photo-preview-img {
  max-width: 240px;
  max-height: 180px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  display: block;
}

.photo-preview-actions {
  margin-top: 8px;
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

@media screen and (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-left,
  .toolbar-right {
    width: 100%;
  }

  .search-input {
    width: 100%;
  }

  .pagination-wrap {
    justify-content: center;
  }
}
.required-mark {
  color: #f56c6c;
  margin-right: 4px;
  font-weight: 700;
}
</style>