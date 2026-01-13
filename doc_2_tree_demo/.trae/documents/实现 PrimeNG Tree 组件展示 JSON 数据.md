# 实现 PrimeNG Tree 组件展示 JSON 数据

## 1. 安装 PrimeNG 依赖
- 运行 `npm install primeng @primeng/themes` 安装 PrimeNG 库

## 2. 配置 PrimeNG
- 在 `app.config.ts` 中添加 PrimeNG 的配置和主题

## 3. 创建 JSON 数据服务
- 创建 `src/app/services/json-data.service.ts`
- 实现从 resources 文件夹加载 JSON 数据的方法
- 实现数据转换逻辑:
  - 从 `root/pdf_info` 开始遍历
  - 只保留带有 `page_idx` 或 `type` 属性的节点
  - 带有 `page_idx` 的节点显示为 `page{page_idx}`
  - 带有 `type` 的节点显示其属性值
  - 只有叶子节点显示 checkbox

## 4. 创建 Tree 组件
- 创建 `src/app/components/json-tree/json-tree.component.ts`
- 创建 `src/app/components/json-tree/json-tree.component.html`
- 创建 `src/app/components/json-tree/json-tree.component.scss`
- 使用 PrimeNG Tree 组件展示数据
- 实现节点选择逻辑

## 5. 更新主应用
- 在 `app.ts` 中引入并使用新的 Tree 组件
- 更新 `app.html` 以展示 Tree 组件

## 6. 测试验证
- 运行 `ng serve` 启动开发服务器
- 验证 Tree 组件正确显示 JSON 数据结构
- 验证 checkbox 只在叶子节点显示
- 验证节点名称正确显示