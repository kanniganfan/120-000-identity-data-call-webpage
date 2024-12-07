const { createApp, ref, computed, onMounted } = Vue;

const app = createApp({
    setup() {
        // 数据状态
        const people = ref([]);
        const searchName = ref('');
        const selectedGender = ref('');
        const selectedYear = ref('');
        const selectedProvince = ref('');
        const birthYears = ref([]);
        const provinces = ref([]);
        const currentPage = ref(1);
        const pageSize = ref(20);
        const loading = ref(true);

        // 主题状态
        const isDark = ref(localStorage.getItem('theme') === 'dark');
        
        // 省份代码映射
        const provinceMap = {
            '11': '北京', '12': '天津', '13': '河北', '14': '山西', '15': '内蒙古',
            '21': '辽宁', '22': '吉林', '23': '黑龙江',
            '31': '上海', '32': '江苏', '33': '浙江', '34': '安徽', '35': '福建', '36': '江西', '37': '山东',
            '41': '河南', '42': '湖北', '43': '湖南', '44': '广东', '45': '广西', '46': '海南',
            '50': '重庆', '51': '四川', '52': '贵州', '53': '云南', '54': '西藏',
            '61': '陕西', '62': '甘肃', '63': '青海', '64': '宁夏', '65': '新疆',
            '71': '台湾',
            '81': '香港', '82': '澳门',
            '90': '外籍', '91': '国外', '92': '其他', '93': '其他', '94': '其他', '95': '其他',
            '96': '其他', '97': '其他', '98': '其他', '99': '其他'
        };

        // 国家/地区代码映射
        const foreignCountryMap = {
            // 亚洲
            '9010': '日本', '9011': '韩国', '9012': '朝鲜', '9013': '蒙古',
            '9014': '越南', '9015': '老挝', '9016': '柬埔寨', '9017': '缅甸',
            '9018': '泰国', '9019': '马来西亚', '9020': '新加坡', '9021': '文莱',
            '9022': '菲律宾', '9023': '印度尼西亚', '9024': '印度', '9025': '巴基斯坦',
            '9026': '孟加拉国', '9027': '斯里兰卡', '9028': '尼泊尔', '9029': '不丹',
            // 中东
            '9030': '阿富汗', '9031': '伊朗', '9032': '伊拉克', '9033': '叙利亚',
            '9034': '黎巴嫩', '9035': '约旦', '9036': '以色列', '9037': '巴勒斯坦',
            '9038': '沙特阿拉伯', '9039': '阿联酋', '9040': '阿曼', '9041': '也门',
            // 欧洲
            '9110': '英国', '9111': '法国', '9112': '德国', '9113': '意大利',
            '9114': '西班牙', '9115': '葡萄牙', '9116': '希腊', '9117': '荷兰',
            '9118': '比利时', '9119': '瑞士', '9120': '奥地利', '9121': '瑞典',
            '9122': '挪威', '9123': '丹麦', '9124': '芬兰', '9125': '爱尔兰',
            '9126': '俄罗斯', '9127': '乌克兰', '9128': '白俄罗斯', '9129': '波兰',
            // 美洲
            '9210': '美国', '9211': '加拿大', '9212': '墨西哥', '9213': '巴西',
            '9214': '阿根廷', '9215': '智利', '9216': '秘鲁', '9217': '哥伦比亚',
            '9218': '委内瑞拉', '9219': '古巴', '9220': '牙买加',
            // 大洋洲
            '9310': '澳大利亚', '9311': '新西兰', '9312': '巴布亚新几内亚',
            // 非洲
            '9410': '埃及', '9411': '南非', '9412': '苏丹', '9413': '利比亚',
            '9414': '埃塞俄比亚', '9415': '肯尼亚', '9416': '坦桑尼亚', '9417': '尼日利亚'
        };

        // 检查是否为有效的中国大陆身份证
        const isValidChineseID = (idCard) => {
            return /^[1-8]\d{16}[\dXx]$/.test(idCard);
        };

        // 从身份证号码中获取性别
        const getGender = (idCard) => {
            if (!idCard) return '未知';
            if (isValidChineseID(idCard)) {
                const sexCode = parseInt(idCard.charAt(16));
                return sexCode % 2 === 1 ? '男' : '女';
            }
            return '未知';
        };

        // 从身份证号码中获取出生年份
        const getBirthYear = (idCard) => {
            if (!idCard) return '未知';
            if (isValidChineseID(idCard)) {
                return idCard.substring(6, 10);
            }
            return '未知';
        };

        // 从身份证号码中获取省份
        const getProvince = (idCard) => {
            if (!idCard) return '未知';
            const provinceCode = idCard.substring(0, 2);
            if (provinceCode >= '90') {
                return '非大陆地区';
            }
            return provinceMap[provinceCode] || '未知';
        };

        // 检查身份证类型和有效性
        const checkIdCardType = (idCard) => {
            if (!idCard) return { type: 'unknown', valid: false };
            
            // 15位老身份证
            if (/^\d{15}$/.test(idCard)) {
                return { type: 'old', valid: true };
            }
            
            // 18位新身份证
            if (/^\d{17}[\dXx]$/.test(idCard)) {
                return { type: 'new', valid: true };
            }

            return { type: 'unknown', valid: false };
        };

        // 从身份证号码中获取出生日期
        const getBirthDate = (idCard) => {
            const idCardInfo = checkIdCardType(idCard);
            if (!idCardInfo.valid) return null;

            let year, month, day;
            if (idCardInfo.type === 'old') {
                // 15位身份证：年份只有两位，需要处理世纪
                year = parseInt('19' + idCard.substring(6, 8));
                month = parseInt(idCard.substring(8, 10));
                day = parseInt(idCard.substring(10, 12));
            } else if (idCardInfo.type === 'new') {
                // 18位身份证
                year = parseInt(idCard.substring(6, 10));
                month = parseInt(idCard.substring(10, 12));
                day = parseInt(idCard.substring(12, 14));
            } else {
                return null;
            }

            return new Date(year, month - 1, day);
        };

        // 计算年龄
        const calculateAge = (birthDate) => {
            if (!birthDate) return '未知';
            
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            // 验证年龄的合理性
            if (age < 0 || age > 120) {
                return '未知';
            }
            
            return age + '岁';
        };

        // 从年龄字符串中提取数字
        const extractAgeNumber = (ageString) => {
            if (!ageString || ageString === '未知') return -1;
            return parseInt(ageString.replace('岁', ''));
        };

        // 获取身份证类型描述
        const getIdCardTypeDesc = (idCard) => {
            const { type, valid } = checkIdCardType(idCard);
            if (!valid) return '无效证件';
            return type === 'old' ? '15位老版身份证' : '18位新版身份证';
        };

        // 验证身份证号码
        const validateIdCard = (idCard) => {
            const idCardInfo = checkIdCardType(idCard);
            if (!idCardInfo.valid) {
                return {
                    valid: false,
                    message: '身份证号码格式不正确'
                };
            }

            // 获取出生日期
            const birthDate = getBirthDate(idCard);
            if (!birthDate || birthDate.toString() === 'Invalid Date') {
                return {
                    valid: false,
                    message: '身份证号码中的日期无效'
                };
            }

            // 验证省份代码
            const provinceCode = idCard.substring(0, 2);
            if (!provinceMap[provinceCode]) {
                return {
                    valid: false,
                    message: '身份证号码中的省份代码无效'
                };
            }

            // 如果是18位身份证，验证校验码
            if (idCardInfo.type === 'new') {
                const coefficients = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
                const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
                
                let sum = 0;
                for (let i = 0; i < 17; i++) {
                    sum += parseInt(idCard[i]) * coefficients[i];
                }
                
                const expectedCheckCode = checkCodes[sum % 11];
                const actualCheckCode = idCard[17].toUpperCase();
                
                if (expectedCheckCode !== actualCheckCode) {
                    return {
                        valid: false,
                        message: '身份证号码校验码不正确'
                    };
                }
            }

            return {
                valid: true,
                message: `有效的${idCardInfo.type === 'old' ? '15位老版' : '18位新版'}身份证`
            };
        };

        // 获取详细年龄
        const getDetailedAge = (idCard) => {
            if (!isValidChineseID(idCard)) return '未知';
            
            const birthDate = new Date(
                idCard.substring(6, 10),
                parseInt(idCard.substring(10, 12)) - 1,
                idCard.substring(12, 14)
            );
            
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age + '岁';
        };

        // 获取生日
        const getBirthday = (idCard) => {
            if (!isValidChineseID(idCard)) return '未知';
            const year = idCard.substring(6, 10);
            const month = idCard.substring(10, 12);
            const day = idCard.substring(12, 14);
            return `${year}年${month}月${day}日`;
        };

        // 复制文本到剪贴板
        const copyToClipboard = (text, type) => {
            navigator.clipboard.writeText(text).then(() => {
                ElementPlus.ElMessage({
                    message: `${type}已复制到剪贴板`,
                    type: 'success',
                    duration: 2000
                });
            }).catch(() => {
                ElementPlus.ElMessage({
                    message: '复制失败，请手动复制',
                    type: 'error',
                    duration: 2000
                });
            });
        };

        // 获取国家/地区信息
        const getCountryInfo = (idCard) => {
            if (!idCard || idCard.length < 4) return null;
            
            const prefix = idCard.substring(0, 2);
            const subCode = idCard.substring(0, 4);

            // 处理中国大陆、港澳台
            if (prefix < '90') {
                if (prefix === '81') return '中国香港';
                if (prefix === '82') return '中国澳门';
                if (prefix === '71') return '中国台湾';
                return null; // 中国大陆返回null
            }

            // 处理外国人
            if (foreignCountryMap[subCode]) {
                return foreignCountryMap[subCode];
            }

            // 处理其他特殊情况
            if (prefix === '90') return '外籍';
            if (prefix === '91') return '国外';
            if (prefix >= '92' && prefix <= '99') return '其他';

            return null;
        };

        // 获取身份证类型和国家/地区标注
        const getIdCardNote = (idCard) => {
            const { type } = checkIdCardType(idCard);
            const countryInfo = getCountryInfo(idCard);
            
            let notes = [];
            
            // 添加证件类型标注
            if (type === 'old') {
                notes.push('老式');
            }
            
            // 添加国家/地区标注
            if (countryInfo) {
                notes.push(countryInfo);
            }
            
            return notes.length > 0 ? `（${notes.join('/')}）` : '';
        };

        // 格式化身份证号码显示
        const formatIdCard = (idCard) => {
            if (!idCard) return '';
            const note = getIdCardNote(idCard);
            return idCard + note;
        };

        // 显示详细信息弹窗
        const showDetailDialog = (person) => {
            const validation = validateIdCard(person.idCard);
            const birthDate = getBirthDate(person.idCard);
            const age = calculateAge(birthDate);
            const idCardType = getIdCardTypeDesc(person.idCard);
            const countryInfo = getCountryInfo(person.idCard);

            ElementPlus.ElMessageBox.alert(
                `<div class="detail-dialog">
                    <div class="detail-item">
                        <span class="label">姓名：</span>
                        <div class="value-container">
                            <span class="value">${person.name}</span>
                            <el-button
                                class="copy-btn"
                                size="small"
                                type="primary"
                                link
                                onclick="app._instance.ctx.copyToClipboard('${person.name}', '姓名')">
                                复制
                            </el-button>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="label">性别：</span>
                        <span class="value">${person.gender}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">年龄：</span>
                        <span class="value">${age}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">证件类型：</span>
                        <span class="value">${idCardType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">省份/国家：</span>
                        <span class="value">${countryInfo || person.province}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">身份证号码：</span>
                        <div class="value-container">
                            <span class="value">${person.idCardDisplay}</span>
                            <el-button
                                class="copy-btn"
                                size="small"
                                type="primary"
                                link
                                onclick="app._instance.ctx.copyToClipboard('${person.idCard}', '身份证号码')">
                                复制
                            </el-button>
                        </div>
                    </div>
                    <div class="detail-item">
                        <span class="label">证件验证：</span>
                        <span class="value ${validation.valid ? 'valid' : 'invalid'}">
                            ${validation.message}
                        </span>
                    </div>
                </div>`,
                '详细信息',
                {
                    dangerouslyUseHTMLString: true,
                    customClass: 'detail-dialog-wrapper',
                    callback: () => {}
                }
            );
        };

        // 计算属性：筛选后的数据
        const filteredPeople = computed(() => {
            let result = people.value;

            // 按名字筛选
            if (searchName.value) {
                result = result.filter(person => 
                    person.name.toLowerCase().includes(searchName.value.toLowerCase())
                );
            }

            // 按性别筛选
            if (selectedGender.value) {
                result = result.filter(person => 
                    person.gender === selectedGender.value
                );
            }

            // 按年龄筛选
            if (selectedYear.value) {
                result = result.filter(person => 
                    person.age === selectedYear.value
                );
            }

            // 按省份筛选
            if (selectedProvince.value) {
                result = result.filter(person => 
                    person.province === selectedProvince.value
                );
            }

            // 分页处理
            const startIndex = (currentPage.value - 1) * pageSize.value;
            return result.slice(startIndex, startIndex + pageSize.value);
        });

        // 计算总数
        const totalCount = computed(() => {
            let result = people.value;
            if (searchName.value) {
                result = result.filter(person => 
                    person.name.toLowerCase().includes(searchName.value.toLowerCase())
                );
            }
            if (selectedGender.value) {
                result = result.filter(person => 
                    person.gender === selectedGender.value
                );
            }
            if (selectedYear.value) {
                result = result.filter(person => 
                    person.age === selectedYear.value
                );
            }
            if (selectedProvince.value) {
                result = result.filter(person => 
                    person.province === selectedProvince.value
                );
            }
            return result.length;
        });

        // 分页处理方法
        const handleSizeChange = (val) => {
            pageSize.value = val;
            currentPage.value = 1;
        };

        const handleCurrentChange = (val) => {
            currentPage.value = val;
        };

        // 重置筛选条件
        const resetFilters = () => {
            searchName.value = '';
            selectedGender.value = '';
            selectedYear.value = '';
            selectedProvince.value = '';
            currentPage.value = 1;
        };

        // 读取文件数据
        const loadData = async () => {
            try {
                loading.value = true;
                const response = await fetch('ppl/12w.txt');
                const text = await response.text();
                const lines = text.split('\n');
                
                const parsedPeople = lines.map(line => {
                    const [name, idCard] = line.split('----').map(item => item.trim());
                    if (!name || !idCard) return null;
                    
                    const birthDate = getBirthDate(idCard);
                    const age = calculateAge(birthDate);
                    
                    return {
                        name,
                        idCard,
                        idCardDisplay: formatIdCard(idCard),
                        gender: getGender(idCard),
                        age,
                        province: getProvince(idCard)
                    };
                }).filter(person => person !== null);

                people.value = parsedPeople;

                // 提取所有年龄并排序
                const uniqueAges = new Set(parsedPeople.map(p => p.age));
                birthYears.value = Array.from(uniqueAges)
                    .filter(a => a !== '未知')
                    .sort((a, b) => {
                        const ageA = extractAgeNumber(a);
                        const ageB = extractAgeNumber(b);
                        return ageA - ageB;
                    });

                // 提取所有省份并排序
                const uniqueProvinces = new Set(parsedPeople.map(p => p.province));
                provinces.value = Array.from(uniqueProvinces)
                    .filter(p => p)
                    .sort((a, b) => {
                        if (a === '未知') return 1;
                        if (b === '未知') return -1;
                        if (a === '非大陆地区') return 1;
                        if (b === '非大陆地区') return -1;
                        return a.localeCompare(b);
                    });

                ElementPlus.ElMessage.success('数据加载成功');
            } catch (error) {
                console.error('加载数据失败:', error);
                ElementPlus.ElMessage.error('数据加载失败，请刷新页面重试');
            } finally {
                loading.value = false;
            }
        };

        // 切换主题
        const toggleTheme = () => {
            isDark.value = !isDark.value;
            const theme = isDark.value ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        };

        // 初始化主题
        const initTheme = () => {
            const savedTheme = localStorage.getItem('theme') || 'light';
            document.documentElement.setAttribute('data-theme', savedTheme);
            isDark.value = savedTheme === 'dark';
        };

        // 页面加载时初始化
        onMounted(() => {
            initTheme();
            loadData();
        });

        return {
            people,
            searchName,
            selectedGender,
            selectedYear,
            selectedProvince,
            birthYears,
            provinces,
            filteredPeople,
            currentPage,
            pageSize,
            totalCount,
            loading,
            handleSizeChange,
            handleCurrentChange,
            resetFilters,
            showDetailDialog,
            copyToClipboard,
            isDark,
            toggleTheme
        };
    }
});

app.use(ElementPlus);
app.mount('#app'); 