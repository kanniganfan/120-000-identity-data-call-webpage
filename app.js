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

            // 按出生年份筛选
            if (selectedYear.value) {
                result = result.filter(person => 
                    person.birthYear === selectedYear.value
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
                    person.birthYear === selectedYear.value
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

        // 读取文件数据
        const loadData = async () => {
            try {
                const response = await fetch('ppl/12w.txt');
                const text = await response.text();
                const lines = text.split('\n');
                
                const parsedPeople = lines.map(line => {
                    const [name, idCard] = line.split('----').map(item => item.trim());
                    if (!name || !idCard) return null;
                    
                    return {
                        name,
                        idCard,
                        gender: getGender(idCard),
                        birthYear: getBirthYear(idCard),
                        province: getProvince(idCard)
                    };
                }).filter(person => person !== null);

                people.value = parsedPeople;

                // 提取所有出生年份并排序
                const uniqueYears = new Set(parsedPeople.map(p => p.birthYear));
                birthYears.value = Array.from(uniqueYears)
                    .filter(y => y && y !== '未知')
                    .sort()
                    .reverse();

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
            } catch (error) {
                console.error('加载数据失败:', error);
                ElementPlus.ElMessage.error('数据加载失败，请刷新页面重试');
            }
        };

        // 页面加载时读取数据
        onMounted(() => {
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
            handleSizeChange,
            handleCurrentChange
        };
    }
});

app.use(ElementPlus);
app.mount('#app'); 