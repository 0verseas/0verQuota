const app = (function () {

  /**
   * cache DOM
   */


  const $schoolTitle = $('#school-title');
  const $schoolEngTitle = $('#school-eng-title');

  // 學校資訊 DOM

  const $schoolPhone = $('#school-phone');
  const $schoolFax = $('#school-fax');
  const $schoolAddress = $('#school-address');
  const $schoolEngAddress = $('#school-eng-address');
  const $schoolUrl = $('#school-url');
  const $schoolEngUrl = $('#school-eng-url');
  const $hasFiveYearStudentAllowed = $('#has-five-year-student-allowed');
  const $hasSelfEnrollment = $('#has-self-enrollment');
  const $hasDorm = $('#has-dorm');
  const $dormDl = $('#dorm-dl');
  const $hasScholarship = $('#has-scholarship');
  const $scholarshipDl = $('#scholarship-dl');
  const $systemDescription = $('#system-description');
  const $systemEngDescription = $('#system-eng-description');

  // 系所資料 DOM

  const $deptId = $('#dept-id');
  const $deptCardCode = $('#dept-card-code');
  const $deptUrl = $('#dept-url');
  const $deptEngUrl = $('#dept-eng-url');
  const $groupCode = $('#group-code');
  const $genderLimit = $('#gender-limit');
  const $mainGroup = $('#main-group');
  const $subGroup = $('#sub-group');
  const $evalTitle = $('#eval-title');
  const $evalEngTitle = $('#eval-eng-title');
  const $deptHasSelfEnrollment = $('#dept-has-self-enrollment');
  const $deptHasSpecialClass = $('#dept-has-special-class');
  const $deptHasForeignSpecialClass = $('#dept-has-foreign-special-class');
  const $deptDescription = $('#dept-description');
  const $deptEngDescription = $('#dept-eng-description');

  // 審查項目 DOM

  const $shenchaItemDiv = $('#nav-shenchaItem');

  /**
   * init
   */

  _init();

  /**
   * functions
   */

  // render 所有資料
  function renderData(data){

    $schoolTitle.html(`${data.title} ${data.departments[0].title}`);
    $schoolEngTitle.html(`${data.eng_title} ${data.departments[0].eng_title}`);

    // render 學校資料
    $schoolPhone.html(data.phone);
    $schoolFax.html(data.phone);
    $schoolAddress.html(data.address);
    $schoolEngAddress.html(data.eng_address);
    $schoolUrl.html(`<a href="${data.url}" target="_blank">${data.url}</a>`);
    $schoolEngUrl.html(`<a href="${data.eng_url}" target="_blank">${data.eng_url}</a>`);
    $hasFiveYearStudentAllowed.html(data.has_five_year_student_allowed ? `<span class="oi oi-check"></sapn>` :`<span class="oi oi-x"></sapn>`);
    $hasSelfEnrollment.html(data.has_self_enrollment ? `<span class="oi oi-check"></sapn>` :`<span class="oi oi-x"></sapn>`);

    $hasDorm.html(data.has_dorm ? `<span class="oi oi-check"></sapn>` :`<span class="oi oi-x"></sapn>`);
    if (data.has_dorm) {
      $dormDl.append(`
      <dt class="col-sm-4">說明 <small class="text-muted">Introuction</small></dt>
      <dd class="col-sm-8">
        <p>${data.dorm_info}</p>
        <p>${data.eng_dorm_info}</p>
      </dd>
      `);
    }

    $hasScholarship.html(data.has_scholarship ? `<span class="oi oi-check"></sapn>` :`<span class="oi oi-x"></sapn>`);
    if (data.has_scholarship) {
      $scholarshipDl.append(`
      <dt class="col-sm-4">中文說明 <small class="text-muted">Chinese shuō míng</small></dt>
      <dd class="col-sm-8"><a href="${data.scholarship_url}" target="_blank">${data.scholarship_url}</a></dd>

      <dt class="col-sm-4">英文說明 <small class="text-muted">English shuō mínge</small></dt>
      <dd class="col-sm-8"><a href="${data.eng_scholarship_url}" target="_blank">${data.eng_scholarship_url}</a></dd>

      <dt class="col-sm-4">負責單位 <small class="text-muted">fù zé dān wèi</small></dt>
      <dd class="col-sm-8">
        <p>${data.scholarship_dept}</p>
        <p id="eng-scholarship-dept">${data.eng_scholarship_dept}</p>
      </dd>
      `);
    }

    $systemDescription.html(data.systems[0].description);
    $systemEngDescription.html(data.systems[0].eng_description);

    // render 系所資料

    $deptId.html(data.departments[0].id);
    $deptCardCode.html(data.departments[0].card_code);
    $deptUrl.html(`<a href="${data.departments[0].url}" target="_blank">${data.departments[0].url}</a>`);
    $deptEngUrl.html(`<a href="${data.departments[0].eng_url}" target="_blank">${data.departments[0].eng_url}</a>`);
    $groupCode.html(data.departments[0].group_code);
    $genderLimit.html(data.departments[0].gender_limit);
    $mainGroup.html(`${data.departments[0].main_group_data.title} ${data.departments[0].main_group_data.eng_title}`);
    if (data.departments[0].sub_group != null) {
      $subGroup.html(`${data.departments[0].sub_group_data.title} ${data.departments[0].sub_group_data.eng_title}`);
    } else {
      $subGroup.html(`無 None`);
    }
    $evalTitle.html(data.departments[0].evaluation_level.title);
    $evalEngTitle.html(data.departments[0].evaluation_level.eng_title);
    $deptHasSelfEnrollment.html(data.departments[0].has_self_enrollment ? `<span class="oi oi-check"></span>` : `<span class="oi oi-x"></span>`);
    $deptHasSpecialClass.html(data.departments[0].has_special_class ? `<span class="oi oi-check"></span>` : `<span class="oi oi-x"></span>`);
    $deptHasForeignSpecialClass.html(data.departments[0].has_foreign_special_class ? `<span class="oi oi-check"></span>` : `<span class="oi oi-x"></span>`);
    $deptDescription.html(data.departments[0].description);
    $deptEngDescription.html(data.departments[0].eng_description);

    // render 審查項目
    if (data.departments[0].application_docs.length == 0) {
      $('#nav-shenchaItem-tab').remove();
    }
    // 審查費用
    if (data.departments[0].has_review_fee) {
      $shenchaItemDiv.append(`
      <div>
        <h4>審查費用 <small class="text-muted">Zuìgāo xuélì zhèngmíng</small></h4>
        <dl class="row">
          <dt class="col-md-4">說明 <small class="text-muted">Description</small></dt>
          <dd class="col-md-8">
            <p>${data.departments[0].review_fee_detail}</p>
            <p>${data.departments[0].eng_review_fee_detail}</p>
          </dd>
        </dl>
      </div>
      <hr>
    `);
    }


  }

  // 拿資料、放資料
  function getDepartmentDetail(id, schoolCode) {
    API.getDepartmentDetail('bachelor', schoolCode, id).then(data => {

      renderData(data);

    }).catch(error => {
      alert(`Can't find the department, please try again.`);
      window.location.replace('index.html');
      console.error(error);
    });
  }

  function _init() {
    // 擷取網址參數
    const params = new URLSearchParams(document.location.search.substring(1));
    const id = params.get('id');
    const schoolCode = params.get('school_code');

    // render 所有資料
    getDepartmentDetail(id, schoolCode);
  }

  return {

  }

})();
