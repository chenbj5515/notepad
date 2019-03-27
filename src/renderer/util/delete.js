import store from '../store'
import Vue from 'vue'
var vm = new Vue()
var getParent = function(root, node) {
    if ( root.children) {
        for (var i = 0; i < root.children.length; i++) {
            if (root.children[i] === node) {
                return root
            }
            let result = getParent(root.children[i], node)
            if(result) {
                return result
            }
        }
    }
}
var deleteNode = function(selectType) {
    let parent = {}
    //参数控制删除右击选中的节点还是左击选中的节点
    try {
        if (selectType === 'right') {
            parent = getParent(store.state.root, store.state.currentRightSelectNode)
        } else {
            parent = getParent(store.state.root, store.state.currentNode)
        }
        let index = parent.children.indexOf(store.state.currentRightSelectNode)
        parent.children.splice(index, 1)
        vm.$Message.success('删除成功')
    } catch(err) {
        vm.$Message.error('删除失败')
    } 
}

var currentFiles = function() {
    let currentNode = store.state.currentNode
    let arr = []
    if (currentNode && currentNode.children && currentNode.children.length > 0) {
        currentNode.children.forEach(item => {
            if (item.type === 2) {
                arr.push(item)
            }
        })
    }
    return arr
}

var deleteFile = function() {
    let parent = {}
    //参数控制删除右击选中的节点还是左击选中的节点
    try {
        parent = getParent(store.state.root, store.state.currentFile)
        let index = parent.children.indexOf(store.state.currentFile)
        parent.children.splice(index, 1)
        vm.$Message.success('删除成功')
        //删除成功后，自动把待删除的当前file换成当前样式为选中的文件，使用户可以无缝隙地连续删除
        store.dispatch('setCurrentFile', currentFiles()[0])
    } catch(err) {
        vm.$Message.error('删除失败')
    } 
}
export default  {
    deleteNode,
    getParent,
    deleteFile
}