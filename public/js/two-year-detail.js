loading.start();
const app = (function () {

  /**
   * cache DOM
   */

  // 頁面 DOM
  const $schoolTitle = $('#school-title');
  const $deptTitle = $('#dept-title');
  const $schoolEngTitle = $('#school-eng-title');
  const $deptEngTitle = $('#dept-eng-title');
  const $navShenchaItemTab = $('#nav-shenchaItem-tab');

  // 學校資訊 DOM
  const $schoolPhone = $('#school-phone');
  const $schoolFax = $('#school-fax');
  const $schoolAddress = $('#school-address');
  const $schoolEngAddress = $('#school-eng-address');
  const $schoolUrl = $('#school-url');
  const $schoolEngUrl = $('#school-eng-url');
  const $hasFiveYearStudentAllowed = $('#has-five-year-student-allowed');
  // const $hasSelfEnrollment = $('#has-self-enrollment');
  const $hasDorm = $('#has-dorm');
  const $dormDl = $('#dorm-dl');
  const $dormInfo = $('.dorm-info');
  const $dormInfoText = $('#dorm-info-text');
  const $dormInfoEngText = $('#dorm-info-eng-text');
  const $hasScholarship = $('#has-scholarship');
  const $scholarshipDl = $('#scholarship-dl');
  const $scholarshipInfo = $('.scholarship-info');
  const $scholarshipDept = $('#scholarship-dept');
  const $scholarshipEngDept = $('#scholarship-eng-dept');
  const $scholarshipUrl = $('#scholarship-url');
  const $scholarshipEngUrl = $('#scholarship-eng-url');
  const $systemDescription = $('#system-description');
  const $systemEngDescription = $('#system-eng-description');

  // 系所資料 DOM
  const $deptUrl = $('#dept-url');
  const $deptEngUrl = $('#dept-eng-url');
  const $groupCode = $('#group-code');
  const $genderLimit = $('#gender-limit');
  const $mainGroup = $('#main-group');
  const $subGroup = $('#sub-group');
  // const $deptHasSelfEnrollment = $('#dept-has-self-enrollment');
  // const $deptHasSpecialClass = $('#dept-has-special-class');
  // const $deptHasForeignSpecialClass = $('#dept-has-foreign-special-class');
  const $deptDescription = $('#dept-description');
  const $deptEngDescription = $('#dept-eng-description');
  const $admissionSelectionQuota = $('#admission-selection-quota');

  // 審查項目 DOM
  const $shenchaItemDiv = $('#nav-shenchaItem');
  const $reviewFee = $('#review-review-fee-detail');
  const $hasReviewFee = $('#has-review-fee');
  const $reviewFeeInfo = $('.review-fee-info');
  const $reviewFeeDetail = $('#review-fee-detail');
  const $reviewFeeEngDetail = $('#review-fee-eng-detail');

  /**
   * init
   */

  // 擷取網址參數
  const params = new URLSearchParams(document.location.search.substring(1));
  const id = params.get('id');
  const schoolId = params.get('school-id');
  let tab = params.get('tab');

  _init();

  /**
   * functions
   */

  // 切換分頁
  function changeTab(tabHash) {
    // 設定預設分頁為「系所資訊」
    let tab = tabHash.substring(1);
    if ((tab != 'nav-schoolInfo') && (tab != 'nav-deptInfo') && (tab != 'nav-shenchaItem')) {
      tab = 'nav-deptInfo';
    }

    // 準備網址參數
    const paramsStr = jQuery.param({
      id,
      'school-id': schoolId,
      tab,
    });

    // 準備新網址
    const newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${paramsStr}`;

    // 更新網址
    window.history.replaceState({path: newurl}, null, newurl);

    // 顯示所選之分頁
    $(`#infoTab a[href="#${tab}"]`).tab('show');
  }

  // render 所有資料
  function renderData(school, system, department) {
    // 設定 boolean 顯示字串
    const trueIconHtml = '有 Yes';
    const falseIconHtml = '無 No';

    // 系所標題
    $schoolTitle.html(`${school.title}`);
    $deptTitle.html(`${department.title}（香港二年學士班）`);
    $schoolEngTitle.html(`${school.eng_title}`);
    $deptEngTitle.html(`${department.eng_title} (Two Year)`);


    // 學校基本資訊
    $schoolPhone.html(school.phone);
    $schoolFax.html(school.fax);
    $schoolAddress.html(school.address);
    $schoolEngAddress.html(school.eng_address);
    $schoolUrl.html(`<a href="${school.url}" target="_blank">${school.url}</a>`);
    $schoolEngUrl.html(_isProvide(school.eng_url) ? `<a href="${school.eng_url}" target="_blank">${school.eng_url}</a>` : '');
    $hasFiveYearStudentAllowed.html(school.has_five_year_student_allowed ? trueIconHtml : falseIconHtml);
    // $hasSelfEnrollment.html(school.has_self_enrollment ? trueIconHtml : falseIconHtml);

    // 學校住宿資訊
    $hasDorm.html(school.has_dorm ? trueIconHtml : falseIconHtml);
    // 有提供則顯示說明
    if (school.has_dorm) {
      $dormInfoText.html(school.dorm_info);
      $dormInfoEngText.html(school.eng_dorm_info);
    } else {
      $dormInfo.remove();
    }

    // 學校獎學金資訊
    $hasScholarship.html(school.has_scholarship ? trueIconHtml : falseIconHtml);
    // 有提供則顯示說明、負責單位
    if (school.has_scholarship) {
      $scholarshipUrl.html(`<a href="${school.scholarship_url}" target="_blank">${school.scholarship_url}</a>`);
      $scholarshipEngUrl.html(_isProvide(school.scholarship_eng_url) ? `<a href="${school.scholarship_eng_url}" target="_blank">${school.scholarship_eng_url}</a>` : '');
      $scholarshipDept.html(school.scholarship_dept);
      $scholarshipEngDept.html(school.scholarship_eng_dept);
    } else {
      $scholarshipInfo.remove();
    }

    // 學則資訊
    $systemDescription.html(system.description);
    $systemEngDescription.html(system.eng_description);

    // 系所基本資料
    $deptUrl.html(`<a href="${department.url}" target="_blank">${department.url}</a>`);
    $deptEngUrl.html(_isProvide(department.eng_url) ? `<a href="${department.eng_url}" target="_blank">${department.eng_url}</a>` : '');
    // $deptHasSelfEnrollment.html(department.has_self_enrollment ? trueIconHtml : falseIconHtml);
    // $deptHasSpecialClass.html(department.has_special_class ? trueIconHtml : falseIconHtml);
    // $deptHasForeignSpecialClass.html(department.has_foreign_special_class ? trueIconHtml : falseIconHtml);
    $deptDescription.html(department.description);
    $deptEngDescription.html(department.eng_description);
    $admissionSelectionQuota.html(`${department.admission_selection_ratify_quota} 名`);

    // 系所招收性別限制
    let genderLimitString = '無限制 Unlimited';
    if (department.gender_limit !== null) {
      genderLimitString = department.gender_limit.toLowerCase() === 'm' ? '限男 Male only' : '限女 Female only ';
    }
    $genderLimit.html(genderLimitString);

    // 學群（次要學群可能不存在）
    $mainGroup.html(`${department.main_group_data.title} ${department.main_group_data.eng_title}`);
    if (department.sub_group != null) {
      $subGroup.html(`${department.sub_group_data.title} ${department.sub_group_data.eng_title}`);
    } else {
      $subGroup.html(`無 None`);
    }

     // 審查項目有才顯示
     if (!Array.isArray(department.application_docs) || !department.application_docs.length) {
      $navShenchaItemTab.remove();
    }

    // 審查費用
    $hasReviewFee.html(department.has_review_fee ? trueIconHtml : falseIconHtml);
    // 有審查費用則顯示說明
    if (department.has_review_fee) {
      $reviewFeeDetail.html(department.review_fee_detail);
      $reviewFeeEngDetail.html(department.eng_review_fee_detail);
    } else {
      $reviewFeeInfo.remove();
    }

    // 審查項目們
    for (let doc of department.application_docs) {
      // 審查項目頭段
      let appendData = `
        <div>
          <h4>${doc.type.name} <small class="text-muted">${doc.type.eng_name}</small></h4>
          <dl class="row">
            <dt class="col-8 col-md-4">是否必繳 <small class="text-muted">Must be submitted: Yes/No</small></dt>
            <dd class="col-4 col-md-8">${doc.required ? '必繳 Required' : '選繳 Optional'}</dd>
      `;

      // 判斷是不是師長推薦函
      if(doc.type_id == 26) {
        // 需要紙本
        let paper = doc.paper;
        if (paper !== null) {
          appendData += `
            <dt class="col-8 col-md-4">是否需要紙本推薦函 <small class="text-muted">Must need paper of recommendation letters</small></dt>
            <dd class="col-4 col-md-8">是 Yes</dd>
            <dd class="col-12">
              <dl class="row mb-0">
                <dt class="col-sm-4 pl-4">收件人英文姓名 <small class="text-muted">recipient English Name</small></dt>
                <dd class="col-sm-8">${paper.recipient}</dd>
                <dt class="col-sm-4 pl-4">聯絡電話 <small class="text-muted">Phone</small></dt>
                <dd class="col-sm-8">${paper.phone}</dd>
                <dt class="col-sm-4 pl-4">英文收件地址 <small class="text-muted">English Address</small></dt>
                <dd class="col-sm-8">${paper.address}</dd>
                <dt class="col-sm-4 pl-4">電子郵件 <small class="text-muted">E-mail</small></dt>
                <dd class="col-sm-8">${paper.email}</dd>
                <dt class="col-sm-4 pl-4">收件期限 <small class="text-muted">deadline</small></dt>
                <dd class="col-sm-8">${paper.deadline}</dd>
              </dl>
            </dd>
          `;
        } else {
          appendData += `
            <dt class="col-8 col-md-4">需要紙本推薦函 <small class="text-muted">Xūyào zhǐ běn tuījiàn hán </small></dt>
            <dd class="col-4 col-md-8">${falseIconHtml}</dd>
          `;
        }
      }

      // 審查項目尾段
      appendData += `
            <dt class="col-md-4">說明 <small class="text-muted">Description</small></dt>
            <dd class="col-md-8">
              <p>${doc.description}</p>
              <p>${doc.eng_description}</p>
            </dd>
          </dl>
        </div>
      `;

      // 置放審查項目資料
      $shenchaItemDiv.append(appendData);
    }

  }

  // 確認是否有提供資料
  function _isProvide(data = null) {
    return (data != null) && (data.replace(/^\s+|\s+$/g, '') != '');
  }

  // 頁面初始化
  function _init() {

    // 拿資料
    API.getDepartmentDetail(schoolId, 'twoYear', id).then(response => {
      if (!response.ok) {
        switch (response.statusCode) {
          default:
            console.log(response.errorMessages);
            alert(response.singleErrorMessage);
            window.location.href = 'two-year.html';
        }
        return;
      }

      // 放資料
      const {school, system, department} = response.data;
      renderData(school, system, department);

      // 顯示參數設定的分頁
      changeTab(`#${tab}`);
      loading.complete();
    }).catch(error => {
      console.error(error);
    });
  }

  return {
    changeTab,
  }

})();
