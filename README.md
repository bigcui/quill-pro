# quill-pro
 寻遍全网找不到富文本插入下拉框的组件而不得
 自己mock下element ui的多级下拉组件 简单实现如下
 多级下拉框效果图如下
 select 数据规则如下
 统一挂载 `Quill.selectData` 对象名称必须`type`+ 'List' 命名
 内部会统一处理 否则列表无法渲染 比如`userList`
 结构要求
 ```
 [
     "name": "XXX",
     "code": "XXX",
     "children":[{XXXX}]
 ]
 ```
 ```
 Quill.selectData = {
      userList: userList
    }
    
 ```
![image](https://github.com/bigcui/quill-pro/raw/main/src/assets/select.png)
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your unit tests
```
npm run test:unit
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## refer  https://github.com/surmon-china/vue-quill-editor/blob/master/src/editor.vue