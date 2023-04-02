
if (window.location.href.includes('://www.butian.net/Loo/submit')) {
    // 仅在 *://www.butian.net/Loo/submit* 运行 butian script
    // ------------------------------------ Content ------------------------------------

    // 1. 在页面底部添加获取信息按钮
    const parentElement = document.querySelector('.loopSubBtn');
    const getInfoBtn = document.createElement('input');
    getInfoBtn.type = 'button';
    getInfoBtn.className = 'btn btn-blue threattijao';
    getInfoBtn.id = 'get-info';
    getInfoBtn.value = '获取信息';
    getInfoBtn.setAttribute('rel', 'get-info');
    parentElement.appendChild(getInfoBtn);

    // 添加按钮之间的间隔
    const resetBtn = document.getElementById("reset");
    const space = document.createTextNode("\u00A0\u00A0\u00A0\u00A0");
    resetBtn.parentNode.insertBefore(space, resetBtn.nextSibling);

    // ------------------------------------ Function ------------------------------------

    /*
    Auto Fill Address Analysis:
    1. [x] 监听 getInfoBtn 按钮点击事件, 如果被点击
        1-1 获取已输入的域名或 ip, 保存到 hostValue 变量
        1-2 请求 https://icp.chinaz.com/hostValue, 提取结果中的地址 xxx, 使用 registeredAddress 变量存储
        (向 background.js 发送消息，由后者代为发送请求)
    2. [x] 使用正则表达式提取出省、市、区信息, 自动选择地址

    */

    // Auto Fill Address
    // 1. 监听按钮点击事件
    getInfoBtn.addEventListener('click', function () {
        // 1-1 获取已输入的域名或 ip, 保存到 hostValue 变量
        const hostInput = document.querySelector('input[name="host"]');
        const hostValue = hostInput.value;

        // 1-2 请求 https://icp.chinaz.com/hostValue, 提取结果中的地址 xxx, 使用 registeredAddress 变量存储
        console.log(`Query: https://icp.chinaz.com/${hostValue}`);
        // 发送消息给 background.js，请求数据
        chrome.runtime.sendMessage({ action: 'fetchData', url: `https://icp.chinaz.com/${hostValue}` },
            function (response) {
                // 解析响应得到 HTML 文档
                const parser = new DOMParser();
                const htmlDoc = parser.parseFromString(response, 'text/html');
                // 提取注册地址元素, 业务范围
                const registeredAddressElement = htmlDoc.querySelector('tr:nth-of-type(4) td:last-of-type');
                const businessScopeElement = htmlDoc.querySelector('tr:nth-of-type(5) td:last-of-type');
                // 如果能够找到该元素，提取其中的文本内容并去除首尾空格；否则将注册地址设置为 “无法获取注册地址”
                let registeredAddress = registeredAddressElement ? registeredAddressElement.textContent.trim() : '无法获取注册地址';
                // 如果能够找到该元素, 提取其中的文本内容并去除首尾空格；否则将业务范围设置为 “无法获取业务范围”
                let businessScope = businessScopeElement ? businessScopeElement.textContent.trim() : '无法获取注册地址';

                // Log > background.js
                chrome.runtime.sendMessage({
                    action: 'addLog',
                    url: hostValue,
                    registeredAddress: registeredAddress,
                    queryUrl: `https://icp.chinaz.com/${hostValue}`,
                    businessScope: businessScope
                });
                
                
                console.log(registeredAddress);

                // 2. 使用正则表达式提取出省、市、区信息, 自动选择地址
                /*

                绝对匹配筛选正则, 暂时不用
                const reg = /^(.*?省|.*?自治区)?(.*?市|.*?地区)?(.*?[市区县])?(.*?)$/;
                const match = registeredAddress.match(reg);
                let registeredProvince = '';
                let registeredCity = '';
                let registeredDistrict = '';
                if (match) {
                if (match[1]) {
                    registeredProvince = match[1].replace(/(省|自治区)$/, '');
                }
                if (match[2]) {
                    registeredCity = match[2].replace(/(市|地区)$/, '');
                }
                if (match[3]) {
                    registeredDistrict = match[3].replace(/(区)$/, '');
                }
                console.log(`Province: ${registeredProvince}`);
                console.log(`City: ${registeredCity}`);
                console.log(`District: ${registeredDistrict}`);
                }
                */

                // 定义正则表达式，用于解析地址信息。
                const reg = /^(.*?省|.*?自治区)?(.*?市|.*?地区)?(.*?[市区县])?(.*?)$/;
                const match = registeredAddress.match(reg);
                const registeredInfoList = [];

                // 使用正则表达式解析注册地址，获取省份、城市和区县信息。
                if (match) {
                    if (match[1]) {
                        registeredProvince = match[1].replace(/(省|自治区)$/, "");
                    }
                    if (match[2]) {
                        registeredCity = match[2].replace(/(市|地区)$/, "");
                    }
                    if (match[3]) {
                        registeredDistrict = match[3].replace(/(区)$/, "");
                    }
                }

                // 将解析得到的信息存储到列表中。
                registeredInfoList.push({
                    province: registeredProvince,
                    city: registeredCity,
                    district: registeredDistrict
                });

                // Debug: console.log(registeredInfoList);

                /*
                绝对匹配, 暂时不用
                const selectProvince = document.querySelector('#selec1');
                const selectCity = document.querySelector('#selec2');
                const selectDistrict = document.querySelector('#selec3');
                selectProvince.value = registeredProvince;
                selectProvince.dispatchEvent(new Event('change'));
                selectCity.value = registeredCity;
                selectCity.dispatchEvent(new Event('change'));
                selectDistrict.value = registeredDistrict;
                selectDistrict.dispatchEvent(new Event('change'));
                */

                // 获取三个 select 对象
                const selectProvince = document.querySelector('#selec1');
                const selectCity = document.querySelector('#selec2');
                const selectDistrict = document.querySelector('#selec3');
                
                // 遍历 registeredInfoList 中的所有值
                for (const registeredInfo of registeredInfoList) {
                    // 遍历 registeredInfo 对象的所有属性值
                    for (const value of Object.values(registeredInfo)) {
                    // 如果属性值为空，则跳过本次循环
                    if (!value) {
                        continue;
                    }
                    // Debug: console.log('Traversing - ' + value);
                    // 判断 selectProvince 选项中是否包含遍历的值
                    for (const option of selectProvince.options) {
                        if (option.text.indexOf(value) !== -1) {
                        selectProvince.value = option.text;
                        selectProvince.dispatchEvent(new Event('change'));
                        }
                    }
                    // 判断 selectCity 选项中是否包含遍历的值
                    for (const option of selectCity.options) {
                        if (option.text.indexOf(value) !== -1) {
                        selectCity.value = option.text;
                        selectCity.dispatchEvent(new Event('change'));
                        }
                    }
                    // 判断 selectDistrict 选项中是否包含遍历的值
                    for (const option of selectDistrict.options) {
                        if (option.text.indexOf(value) !== -1) {
                        selectDistrict.value = option.text;
                        selectDistrict.dispatchEvent(new Event('change'));
                        }
                    }
                    }
                }

            }
        );
    });
}