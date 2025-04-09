
/**
*	cache DOM
*/

const $expositionList = $('#exposition-list');
const $filterInput = $('#filter'); // 搜尋欄
const $filterBtn = $('#filter-btn'); // 搜尋按鈕
const $searchInput = $('#search'); // 搜尋欄
const $searchBtn = $('#search-btn'); // 搜尋按鈕
const $subTitle = $('.sub-title');

const $titleArray = ['永平','巴生','吉隆坡','雙溪大年','亞庇','美里'];
let stage = 1;

/**
*	init
*/

_init();

/**
*	bind event
*/

$searchBtn.on('click', getExpositionListWithKeyword); // 列表搜尋更新
$searchInput.keypress((e) => { e.keyCode == 13 && getExpositionListWithKeyword(); }); // 偵測是否在輸入欄按下 enter

$filterBtn.on('click', _filterInput); // 列表篩選
$filterInput.keypress((e) => { e.keyCode == 13 && _filterInput(); }); // 偵測是否在輸入欄按下 enter

async function _init() {
    loading.start();
    const params = new URLSearchParams(document.location.search.substring(1));
    stage = params.get('stage') && params.get('stage').length !== 0 ? params.get('stage') : 1;
    $subTitle.text($titleArray[stage-1]);
    try {
        const response = await getExpositionList();
        if (!response.ok) { throw response; }
        const schoolDatas = await response.json();

        let html = '';
        let htmlArray = [];
        let count = 0;
        for (let schooldata of schoolDatas) {
            if(+schooldata[0]<10){
                schooldata[0] = '0'+schooldata[0];
            }
            htmlArray[count] = `
                <tr>
                    <td style="text-align: center; vertical-align:middle;">
                        ${schooldata[0]}
                    </td>
                    <td style="text-align: center; vertical-align:middle;">
                        ${schooldata[1]}
                        <br/>
                        ${schooldata[2]}
                    </td>
                    <td style="text-align: center; vertical-align:middle;">
                        -
                    </td>
                </tr>
            `;
            count++;
        }

        for(let htmlLine of htmlArray) {
            html += htmlLine;
        }
        await $expositionList.html(html);
        await loading.complete();
    } catch (e) {
        console.error(e);
        await e.json && e.json().then((data) => {
            swal({title: `ERROR`, text: data.messages[0], type:"error", confirmButtonText: '確定', allowOutsideClick: false});
        })
        await loading.complete();
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function _filterInput(){
    let value = $filterInput.val().toLowerCase();
    const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
    value = converter(value);

    $expositionList.find('tr').filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    });

    return;
}


function getExpositionList() {
    return fetch(`${env.baseUrl}/malaysia-exposition/${stage}/school-list`, {
        credentials: 'include'
    });
}

async function getExpositionListWithKeyword() {
    let keyword = $searchInput.val().toLowerCase();
    const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });
    keyword = converter(keyword);

    loading.start();
    try {
        const response = await fetch(`${env.baseUrl}/malaysia-exposition/${stage}/school-list/${keyword}`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        });
        if (!response.ok) { throw response; }
        const schoolDatas = await response.json();

        let html = '';
        let htmlArray = [];
        let count = 0;
        if(schoolDatas.length > 0) {
            for (let schooldata of schoolDatas) {
                if(!schooldata[3]){
                    schooldata[3] = '';
                }
                htmlArray[count] = `
                    <tr>
                        <td style="text-align: center; vertical-align:middle;">
                            ${schooldata[0]}
                        </td>
                        <td style="text-align: center; vertical-align:middle;">
                            ${schooldata[1]}
                            <br/>
                            ${schooldata[2]}
                        </td>
                        <td style="text-align: center; vertical-align:middle;">
                            ${schooldata[3]}
                        </td>
                    </tr>
                `;
                count++;
            }
            for(let htmlLine of htmlArray) {
                html += htmlLine;
            }
        } else {
            html = '<tr><td colspan=16>無符合關鍵字的系所</td></tr>';
        }
        await $expositionList.html(html);
        await loading.complete();
    } catch (e) {
        console.error(e);
        await e.json && e.json().then((data) => {
            swal({title: `ERROR`, text: data.messages[0], type:"error", confirmButtonText: '確定', allowOutsideClick: false});
        })
        await loading.complete();
    }

    return;
}