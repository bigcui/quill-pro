/**
* @file 头部注释
* @author bigcui
* 2021-09-08
*/
function css(obj, attr, value) {
    if (arguments.length === 2) {
        if (obj.currentStyle) {
            return obj.currentStyle[attr];
        } else {
            return getComputedStyle(obj, false)[attr];
        }

    } else if(arguments.length === 3){
        obj.style[attr] = value;
    }
}
function getName(list, value) {
    let result = '';
    function getValo2(list, value) {
        for (var k = 0; k < list.length; k++) {
            var el = list[k];
            if (el.code === value) {
                result = el.name;
                break;
            } else {
                if (el.children) {
                    getValo2(el.children, value);
                }
            }
        }
        return result;
    }
    return getValo2(list, value);
};
function addEventPopper(cDo ,cb){
        // 点击其他区域时, 隐藏指定区域(cDom)
        document.addEventListener("click", event => {
            var cDom = cDo ;
            var tDom = event.target;
            if (cDom == tDom || cDom.contains(tDom)) {
                console.log('clickyes',tDom)
            } else {
              cb && cb();
              console.log('111111')
            }
          });
}
export {
    addEventPopper,
    css,
    getName
}