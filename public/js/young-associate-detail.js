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
  const $schoolEmail = $('#school-email');
  const $schoolAddress = $('#school-address');
  const $schoolEngAddress = $('#school-eng-address');
  const $schoolUrl = $('#school-url');
  const $schoolEngUrl = $('#school-eng-url');
  const $hasFiveYearStudentAllowed = $('#has-five-year-student-allowed');
  const $hasDorm = $('#has-dorm');
  const $dormInfo = $('.dorm-info');
  const $dormInfoText = $('#dorm-info-text');
  const $dormInfoEngText = $('#dorm-info-eng-text');
  const $hasScholarship = $('#has-scholarship');
  const $scholarshipInfo = $('.scholarship-info');
  const $scholarshipDept = $('#scholarship-dept');
  const $scholarshipEngDept = $('#scholarship-eng-dept');
  const $scholarshipUrl = $('#scholarship-url');
  const $scholarshipEngUrl = $('#scholarship-eng-url');
  const $systemDescription = $('#system-description');
  const $systemEngDescription = $('#system-eng-description');

  // 系所資料 DOM
  const $mainGroup = $('#main-group');
  const $subGroup = $('#sub-group');
  const $admissionSelectionQuota = $('#admission-selection-quota');
  const $courseMemo = $('#memo-course');
  const $chCourseMemo = $('#memo-chinese-course');
  const $proCourseMemo = $('#memo-prof-course');
  const $ptMemo = $('#memo-pt');
  const $careerMemo = $('#memo-career');
  const $furtherStdMemo = $('#memo-further-study');
  const $scholarshipMemo = $('#memo-scholarship');
  const $costMemo = $('#memo-cost');
  const $contactMemo = $('#memo-contact');

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
    $deptTitle.html(`${department.title}（海青副學士班）`);
    $schoolEngTitle.html(`${school.eng_title}`);
    $deptEngTitle.html(`${department.eng_title} (Associate Degree)`);


    // 學校基本資訊
    $schoolPhone.html(school.phone);
    $schoolFax.html(school.fax);
    $schoolEmail.html(`<a href=mailto:${school.editor_data.user.email}>${school.editor_data.user.email}</a>`);
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

    /*   系所    */
    // 招生名額
    $admissionSelectionQuota.html(`${department.admission_selection_ratify_quota} 名`);  
    // 學群
    $mainGroup.html(`${department.main_group_data.title} ${department.main_group_data.eng_title}`);
    if (department.sub_group_id != null) {
      $subGroup.html(`${department.sub_group_data.title} ${department.sub_group_data.eng_title}`);
    } else {
      $subGroup.html(`無 None`);
    }
    // 系所資訊
    $courseMemo.html(department.memo_course);
    $chCourseMemo.html(`${department.memo_chinese_course}`);
    $proCourseMemo.html(`${department.memo_prof_course}`);
    // 在學工讀
    $ptMemo.html(`${department.memo_pt}`);
    // 就業輔導
    $careerMemo.html(`${department.memo_career}`);
    // 在臺升讀
    $furtherStdMemo.html(`${department.memo_further_study}`);
    // 獎學金
    $scholarshipMemo.html(`${department.memo_scholarship}`);
    // 各項收費
    $costMemo.html(`${department.memo_cost}`);
    // 聯絡資訊
    $contactMemo.html(`${department.memo_contact}`);
  }

  // 確認是否有提供資料
  function _isProvide(data = null) {
    return (data != null) && (data.replace(/^\s+|\s+$/g, '') != '');
  }

  // 頁面初始化
  function _init() {

    // 拿資料
    API.getDepartmentDetail(schoolId, 'youngAssociate', id).then(response => {
      if (!response.ok) {
        switch (response.statusCode) {
          default:
            // console.log(response.errorMessages);
            swal({title: `Error`, text: response.singleErrorMessage, type:"error", confirmButtonText: '確定', allowOutsideClick: false})
            .then(()=>{
              window.location.href = 'young-associate.html';
            })
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
      // console.error(error);
      swal({title: `Error`, text: error, type:"error", confirmButtonText: '確定', allowOutsideClick: false})
    });
  }

  return {
    changeTab,
  }

})();
