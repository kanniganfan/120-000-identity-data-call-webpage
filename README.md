# 人员信息查询系统

一个现代化的人员信息管理和查询系统，基于 Vue 3 和 Element Plus 构建。支持身份证号码验证、年龄计算、多国籍识别等功能。

## 功能特点

### 🔍 搜索和筛选
- 姓名模糊搜索
- 性别筛选
- 年龄筛选
- 省份/国家筛选

### 📊 数据处理
- 智能识别15位和18位身份证
- 准确计算年龄（考虑月份和日期）
- 支持60+国家和地区识别
- 身份证号码验证

### 🌏 国际化支持
- 中国大陆（按省份）
- 港澳台地区
- 亚洲主要国家
- 欧美主要国家
- 其他国家和地区

### 🎨 界面设计
- 响应式布局
- 深色模式支持
- 现代化 UI 设计
- 流畅动画效果

## 技术栈

- Vue 3 (组合式 API)
- Element Plus
- 现代 CSS3
- ES6+

## 项目结构

```
├── src/
│   ├── assets/        # 静态资源
│   ├── styles/        # 样式文件
│   │   └── main.css   # 主样式文件
│   ├── js/           # JavaScript 文件
│   │   └── app.js    # 主应用逻辑
├── ppl/              # 数据文件
├── index.html        # 主页面
└── README.md         # 项目说明
```

## 快速开始

1. 克隆仓库：
   ```bash
   git clone https://github.com/yourusername/people-info-system.git
   cd people-info-system
   ```

2. 确保数据文件 `12w.txt` 位于 `ppl` 目录下

3. 使用 HTTP 服务器启动项目：
   ```bash
   python -m http.server 8080
   ```

4. 访问 `http://localhost:8080` 即可使用系统

## 数据格式

系统支持以下格式的身份证号码：

- 18位新版身份证：`ddddddyyyymmddxxxx`
- 15位老版身份证：`ddddddyymmddxxx`
- 外籍人士证件：`90xxxxxxxxxx`
- 国外人士证件：`91xxxxxxxxxx`

其中：
- `d`: 地区代码
- `yyyy/yy`: 出生年份
- `mm`: 出生月份
- `dd`: 出生日期
- `x`: 顺序码和校验码

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详细信息 